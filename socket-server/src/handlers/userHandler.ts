import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

export const userHandler = (io: Server, socket: Socket) => {
  // User status update
  socket.on('updateStatus', data => {
    try {
      const { status, customStatus } = data;

      // Update user status in their own socket
      socket.data.status = status;
      socket.data.customStatus = customStatus;

      // Broadcast status change to all connected users
      socket.broadcast.emit('userStatusUpdate', {
        userId: socket.user.userId,
        username: socket.user.username,
        status,
        customStatus,
        timestamp: new Date().toISOString(),
      });

      logger.debug(`User ${socket.user.userId} updated status to: ${status}`);
    } catch (error) {
      logger.error({ error }, 'Status update error');
      socket.emit('error', { code: 'STATUS_ERROR', message: 'Failed to update status' });
    }
  });

  // Get online users
  socket.on('getOnlineUsers', () => {
    try {
      const onlineUsers = Array.from(io.sockets.sockets.values())
        .filter(s => s.user.userId !== socket.user.userId)
        .map(s => ({
          userId: s.user.userId,
          username: s.user.username,
          status: s.data.status || 'online',
          customStatus: s.data.customStatus,
          connectedAt: s.handshake.time,
          lastSeen: new Date().toISOString(),
        }));

      socket.emit('onlineUsers', onlineUsers);
    } catch (error) {
      logger.error({ error }, 'Get online users error');
      socket.emit('error', { code: 'USERS_ERROR', message: 'Failed to get online users' });
    }
  });

  // User search
  socket.on('searchUsers', data => {
    try {
      const { query } = data;

      if (!query || query.length < 2) {
        socket.emit('searchResults', []);
        return;
      }

      // Search through connected users
      const matchingUsers = Array.from(io.sockets.sockets.values())
        .filter(
          s =>
            s.user.username.toLowerCase().includes(query.toLowerCase()) &&
            s.user.userId !== socket.user.userId
        )
        .map(s => ({
          userId: s.user.userId,
          username: s.user.username,
          status: s.data.status || 'online',
          customStatus: s.data.customStatus,
        }));

      socket.emit('searchResults', matchingUsers);
    } catch (error) {
      logger.error({ error }, 'User search error');
      socket.emit('error', { code: 'SEARCH_ERROR', message: 'Failed to search users' });
    }
  });

  // Send friend request
  socket.on('sendFriendRequest', data => {
    try {
      const { recipientId } = data;

      if (!recipientId) {
        socket.emit('error', { code: 'INVALID_REQUEST', message: 'Recipient ID is required' });
        return;
      }

      const recipientSockets = Array.from(io.sockets.sockets.values()).filter(
        s => s.user.userId === recipientId
      );

      if (recipientSockets.length > 0) {
        const requestData = {
          id: generateRequestId(),
          fromUserId: socket.user.userId,
          fromUsername: socket.user.username,
          toUserId: recipientId,
          timestamp: new Date().toISOString(),
          status: 'pending',
        };

        recipientSockets.forEach(recipientSocket => {
          recipientSocket.emit('friendRequest', requestData);
        });

        socket.emit('friendRequestSent', { requestId: requestData.id });

        logger.debug(`Friend request sent from ${socket.user.userId} to ${recipientId}`);
      } else {
        socket.emit('error', { code: 'USER_OFFLINE', message: 'User is currently offline' });
      }
    } catch (error) {
      logger.error({ error }, 'Friend request error');
      socket.emit('error', { code: 'REQUEST_ERROR', message: 'Failed to send friend request' });
    }
  });

  // Handle friend request response
  socket.on('respondToFriendRequest', data => {
    try {
      const { requestId, response } = data; // response: 'accept' | 'decline'

      const senderSockets = Array.from(io.sockets.sockets.values()).filter(
        s => s.user.userId !== socket.user.userId
      );

      senderSockets.forEach(senderSocket => {
        senderSocket.emit('friendRequestResponse', {
          requestId,
          fromUserId: socket.user.userId,
          fromUsername: socket.user.username,
          response,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      logger.error({ error }, 'Friend request response error');
    }
  });
};

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
