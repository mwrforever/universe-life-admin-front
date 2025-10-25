import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger.js';

interface Room {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  createdBy: string;
  createdAt: string;
  members: string[];
  maxMembers: number;
}

// In-memory room storage (in production, use Redis or database)
const rooms = new Map<string, Room>();

export const roomHandler = (io: Server, socket: Socket) => {
  // Create a new room
  socket.on('createRoom', data => {
    try {
      const { name, description, type = 'public', maxMembers = 100 } = data;

      if (!name || name.trim().length === 0) {
        socket.emit('error', { code: 'INVALID_ROOM', message: 'Room name is required' });
        return;
      }

      const roomId = generateRoomId();
      const room: Room = {
        id: roomId,
        name: name.trim(),
        description: description?.trim(),
        type,
        createdBy: socket.user.userId,
        createdAt: new Date().toISOString(),
        members: [socket.user.userId],
        maxMembers,
      };

      rooms.set(roomId, room);

      // Join the creator to the room
      socket.join(roomId);

      // Send room creation confirmation
      socket.emit('roomCreated', room);

      // Broadcast new room to all users (if public)
      if (type === 'public') {
        io.emit('newPublicRoom', room);
      }

      logger.debug(`Room created: ${roomId} by ${socket.user.userId}`);
    } catch (error) {
      logger.error({ error }, 'Create room error');
      socket.emit('error', { code: 'CREATE_ROOM_ERROR', message: 'Failed to create room' });
    }
  });

  // Join a room
  socket.on('joinRoom', data => {
    try {
      const { roomId } = data;

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
        return;
      }

      if (room.members.length >= room.maxMembers) {
        socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full' });
        return;
      }

      if (room.members.includes(socket.user.userId)) {
        socket.emit('error', { code: 'ALREADY_IN_ROOM', message: 'Already in room' });
        return;
      }

      // Add user to room
      room.members.push(socket.user.userId);
      socket.join(roomId);

      // Notify room members
      io.to(roomId).emit('userJoinedRoom', {
        roomId,
        user: {
          userId: socket.user.userId,
          username: socket.user.username,
        },
        memberCount: room.members.length,
        timestamp: new Date().toISOString(),
      });

      // Send room details to the user
      socket.emit('roomJoined', room);

      logger.debug(`User ${socket.user.userId} joined room ${roomId}`);
    } catch (error) {
      logger.error({ error }, 'Join room error');
      socket.emit('error', { code: 'JOIN_ROOM_ERROR', message: 'Failed to join room' });
    }
  });

  // Leave a room
  socket.on('leaveRoom', data => {
    try {
      const { roomId } = data;

      const room = rooms.get(roomId);
      if (!room) {
        return; // Silently ignore if room doesn't exist
      }

      // Remove user from room
      room.members = room.members.filter(id => id !== socket.user.userId);
      socket.leave(roomId);

      // Notify remaining members
      io.to(roomId).emit('userLeftRoom', {
        roomId,
        user: {
          userId: socket.user.userId,
          username: socket.user.username,
        },
        memberCount: room.members.length,
        timestamp: new Date().toISOString(),
      });

      // Send confirmation to user
      socket.emit('roomLeft', { roomId });

      // Delete room if empty and not a persistent system room
      if (room.members.length === 0 && !room.id.startsWith('system_')) {
        rooms.delete(roomId);
        io.emit('roomDeleted', { roomId });
      }

      logger.debug(`User ${socket.user.userId} left room ${roomId}`);
    } catch (error) {
      logger.error({ error }, 'Leave room error');
    }
  });

  // Get available rooms
  socket.on('getRooms', () => {
    try {
      const availableRooms = Array.from(rooms.values())
        .filter(room => room.type === 'public') // Only show public rooms
        .map(room => ({
          id: room.id,
          name: room.name,
          description: room.description,
          memberCount: room.members.length,
          maxMembers: room.maxMembers,
          createdBy: room.createdBy,
          createdAt: room.createdAt,
        }));

      socket.emit('roomsList', availableRooms);
    } catch (error) {
      logger.error({ error }, 'Get rooms error');
      socket.emit('error', { code: 'GET_ROOMS_ERROR', message: 'Failed to get rooms' });
    }
  });

  // Send message to room
  socket.on('sendRoomMessage', data => {
    try {
      const { roomId, message, type = 'text' } = data;

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
        return;
      }

      if (!room.members.includes(socket.user.userId)) {
        socket.emit('error', { code: 'NOT_IN_ROOM', message: 'Not in room' });
        return;
      }

      const messageData = {
        id: generateMessageId(),
        roomId,
        senderId: socket.user.userId,
        senderName: socket.user.username,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all room members
      io.to(roomId).emit('roomMessage', messageData);
    } catch (error) {
      logger.error({ error }, 'Send room message error');
      socket.emit('error', { code: 'ROOM_MESSAGE_ERROR', message: 'Failed to send room message' });
    }
  });

  // Handle disconnect
  socket.on('disconnecting', () => {
    // Remove user from all rooms
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        // Skip the default socket room
        const room = rooms.get(roomId);
        if (room) {
          room.members = room.members.filter(id => id !== socket.user.userId);

          // Notify remaining members
          socket.to(roomId).emit('userLeftRoom', {
            roomId,
            user: {
              userId: socket.user.userId,
              username: socket.user.username,
            },
            memberCount: room.members.length,
            timestamp: new Date().toISOString(),
          });

          // Delete empty rooms
          if (room.members.length === 0 && !room.id.startsWith('system_')) {
            rooms.delete(roomId);
            io.emit('roomDeleted', { roomId });
          }
        }
      }
    }
  });
};

function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
