const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store data in memory (or connect to a cloud database like PostgreSQL or MongoDB)
let schoolData = {
  institution: "St. Vincent's High School, Inc.",
  lastUpdated: new Date().toISOString(),
  updatedBy: "System"
};

io.on('connection', (socket) => {
  console.log('User connected to SVHS Online Portal:', socket.id);

  // Send current state to newly connected browser
  socket.emit('initial_state', schoolData);

  // Real-time broadcast whenever Bookkeeper saves
  socket.on('bookkeeper_save', (data) => {
    schoolData = { ...data, lastUpdated: new Date().toISOString() };
    // Broadcast instantly to all open browsers (Admin, Bookkeeper, Incognito)
    io.emit('realtime_update', schoolData);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`St. Vincent's High School Portal live on port ${PORT}`);
});