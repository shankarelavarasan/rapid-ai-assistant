import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocketServer({ 
  server: server,
  path: '/ws'
});

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', function connection(ws, request) {
  console.log('🔗 Client connected from:', request.socket.remoteAddress);
  
  // Add client to the set
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Welcome to Rapid AI Assistant WebSocket Server!',
    timestamp: new Date().toISOString(),
    clientCount: clients.size
  }));
  
  // Broadcast to all clients that a new user joined
  broadcast({
    type: 'user_joined',
    message: 'A new user joined the collaboration',
    clientCount: clients.size,
    timestamp: new Date().toISOString()
  }, ws);
  
  // Handle incoming messages
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received message:', data);
      
      // Handle different message types
      switch(data.type) {
        case 'file_update':
          // Broadcast file updates to all other clients
          broadcast({
            type: 'file_update',
            filename: data.filename,
            content: data.content,
            user: data.user || 'Anonymous',
            timestamp: new Date().toISOString()
          }, ws);
          break;
          
        case 'cursor_position':
          // Broadcast cursor position to all other clients
          broadcast({
            type: 'cursor_position',
            x: data.x,
            y: data.y,
            user: data.user || 'Anonymous',
            timestamp: new Date().toISOString()
          }, ws);
          break;
          
        case 'chat_message':
          // Broadcast chat messages to all clients
          broadcast({
            type: 'chat_message',
            message: data.message,
            user: data.user || 'Anonymous',
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'project_update':
          // Broadcast project updates to all other clients
          broadcast({
            type: 'project_update',
            action: data.action,
            projectData: data.projectData,
            user: data.user || 'Anonymous',
            timestamp: new Date().toISOString()
          }, ws);
          break;
          
        default:
          // Echo unknown message types
          ws.send(JSON.stringify({
            type: 'echo',
            originalMessage: data,
            timestamp: new Date().toISOString()
          }));
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', function close(code, reason) {
    console.log('🔌 Client disconnected:', code, reason.toString());
    clients.delete(ws);
    
    // Broadcast to remaining clients that a user left
    broadcast({
      type: 'user_left',
      message: 'A user left the collaboration',
      clientCount: clients.size,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle errors
  ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
    clients.delete(ws);
  });
  
  // Send periodic heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // 30 seconds
  
  ws.on('pong', () => {
    console.log('💓 Heartbeat received from client');
  });
});

// Broadcast function to send message to all clients (except sender)
function broadcast(data, sender = null) {
  const message = JSON.stringify(data);
  
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Broadcast to all clients (including sender)
function broadcastToAll(data) {
  const message = JSON.stringify(data);
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Start the server
const PORT = 8081;
server.listen(PORT, () => {
  console.log('🚀 WebSocket Server started on ws://localhost:' + PORT + '/ws');
  console.log('📊 Server ready for Real-Time Collaboration features');
  console.log('🔗 Clients can connect to: ws://localhost:8081/ws');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  
  // Notify all clients about server shutdown
  broadcastToAll({
    type: 'server_shutdown',
    message: 'Server is shutting down',
    timestamp: new Date().toISOString()
  });
  
  // Close all connections
  clients.forEach(client => {
    client.close(1001, 'Server shutdown');
  });
  
  server.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

// Export for potential use in other modules
export { wss, broadcast, broadcastToAll };