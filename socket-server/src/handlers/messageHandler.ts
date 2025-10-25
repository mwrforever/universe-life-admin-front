import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

export const messageHandler = (io: Server, socket: Socket) => {
  // Send message to specific user
  socket.on('sendMessage', async data => {
    try {
      const { recipientId, message, type = 'text' } = data;

      if (!recipientId || !message) {
        socket.emit('error', {
          code: 'INVALID_MESSAGE',
          message: 'Recipient ID and message are required',
        });
        return;
      }

      const messageData = {
        id: generateMessageId(),
        senderId: socket.user.userId,
        senderName: socket.user.username,
        recipientId,
        message,
        type,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      // Find recipient socket
      const recipientSockets = Array.from(io.sockets.sockets.values()).filter(
        s => s.user.userId === recipientId
      );

      if (recipientSockets.length > 0) {
        // Send to online recipient
        recipientSockets.forEach(recipientSocket => {
          recipientSocket.emit('newMessage', messageData);
        });

        // Update message status
        messageData.status = 'delivered';
        socket.emit('messageStatus', { messageId: messageData.id, status: 'delivered' });
      } else {
        // Recipient offline - in production, store in database
        logger.info(`User ${recipientId} is offline, message stored`);
        messageData.status = 'pending';
      }

      // Broadcast to room for real-time updates (if applicable)
      socket.broadcast.emit('userActivity', {
        userId: socket.user.userId,
        activity: 'message_sent',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({ error }, 'Message handling error');
      socket.emit('error', { code: 'MESSAGE_ERROR', message: 'Failed to send message' });
    }
  });

  // Mark message as read
  socket.on('markAsRead', data => {
    try {
      const { messageId } = data;

      // In production, update database
      socket.emit('messageStatus', { messageId, status: 'read' });

      // Notify sender that message was read
      const senderSockets = Array.from(io.sockets.sockets.values()).filter(
        s => s.user.userId !== socket.user.userId
      );

      senderSockets.forEach(senderSocket => {
        senderSocket.emit('messageRead', {
          messageId,
          readBy: socket.user.userId,
          readAt: new Date().toISOString(),
        });
      });
    } catch (error) {
      logger.error({ error }, 'Mark as read error');
    }
  });

  // Typing indicators
  socket.on('typing', data => {
    const { recipientId } = data;

    const recipientSockets = Array.from(io.sockets.sockets.values()).filter(
      s => s.user.userId === recipientId
    );

    recipientSockets.forEach(recipientSocket => {
      recipientSocket.emit('userTyping', {
        userId: socket.user.userId,
        username: socket.user.username,
        isTyping: true,
      });
    });
  });

  socket.on('stopTyping', data => {
    const { recipientId } = data;

    const recipientSockets = Array.from(io.sockets.sockets.values()).filter(
      s => s.user.userId === recipientId
    );

    recipientSockets.forEach(recipientSocket => {
      recipientSocket.emit('userTyping', {
        userId: socket.user.userId,
        isTyping: false,
      });
    });
  });
};

// Helper function to generate message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
