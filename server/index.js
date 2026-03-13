const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const path = require('path');
const connectDB = require('./config/db');
const { Conversation, Message } = require('./models/Chat');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const corsOrigin = process.env.CLIENT_URL || true;

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(clientBuildPath));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/upload', require('./routes/upload'));

// SPA fallback for hosted frontend
app.get(/^\/(?!api|uploads).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap API is running' });
});

// Socket.io — real-time chat
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  onlineUsers.set(socket.userId, socket.id);

  // Notify others this user is online
  io.emit('user-online', socket.userId);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('send-message', async (data) => {
    try {
      const { conversationId, text } = data;
      if (!conversationId || !text || text.trim().length === 0) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === socket.userId
      );
      if (!isParticipant) return;

      const message = new Message({
        conversation: conversationId,
        sender: socket.userId,
        text: text.trim().substring(0, 2000),
      });
      await message.save();

      conversation.lastMessage = {
        text: text.trim().substring(0, 2000),
        sender: socket.userId,
        createdAt: new Date(),
      };
      await conversation.save();

      await message.populate('sender', 'name avatar');

      io.to(conversationId).emit('new-message', message);

      // Notify recipient if not in the conversation room
      const recipientId = conversation.participants.find(
        (p) => p.toString() !== socket.userId
      );
      if (recipientId) {
        const recipientSocketId = onlineUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message-notification', {
            conversationId,
            message,
          });
        }
      }
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('typing', (conversationId) => {
    socket.to(conversationId).emit('user-typing', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('stop-typing', (conversationId) => {
    socket.to(conversationId).emit('user-stop-typing', {
      userId: socket.userId,
      conversationId,
    });
  });

  // WebRTC signaling events
  socket.on('call-user', async ({ targetUserId, offer, callType }) => {
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      let callerName = '';
      try {
        const caller = await User.findById(socket.userId).select('name');
        callerName = caller?.name || '';
      } catch (e) { /* ignore */ }
      io.to(targetSocketId).emit('incoming-call', {
        callerId: socket.userId,
        callerName,
        callType: callType || 'video',
        offer,
      });
    } else {
      socket.emit('call-failed', { reason: 'User is offline' });
    }
  });

  socket.on('call-accepted', ({ callerId, answer }) => {
    const callerSocketId = onlineUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-accepted', { answer });
    }
  });

  socket.on('call-rejected', ({ callerId }) => {
    const callerSocketId = onlineUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-rejected');
    }
  });

  socket.on('ice-candidate', ({ targetUserId, candidate }) => {
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    }
  });

  socket.on('end-call', ({ targetUserId }) => {
    const targetSocketId = onlineUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
    onlineUsers.delete(socket.userId);
    io.emit('user-offline', socket.userId);
  });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
