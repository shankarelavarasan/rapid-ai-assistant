import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiRoutes from './routes/gemini.js';
import githubRoutes from './routes/github.js';
import fileRoutes from './routes/file.js';
import exportRoutes from './routes/export.js';
import processRoutes from './routes/process.js';
import aiStoreRoutes from './routes/aiStore.js';
import partnershipRoutes from './routes/partnership.js';
import paymentRoutes from './routes/payment.js';
import cors from 'cors';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import logger from './config/logger.js';
import {
  errorHandler,
  FileProcessingError,
} from './middleware/errorHandler.js';
import { uploadSingleFile, uploadMultipleFiles } from './middleware/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Get port from environment variable or default to 3001
const PORT = process.env.PORT || 3001;
console.log('Starting server on port:', PORT);

// Create HTTP server and Socket.IO instance for real-time progress updates
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://localhost:10000', 
      'https://shankarelavarasan.github.io',
      'https://shankarelavarasan.github.io/rapid-saas-ai-store'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', socket => {
  logger.info('Client connected: %s', socket.id);

  socket.on('disconnect', () => {
    logger.info('Client disconnected: %s', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:10000', 
      'https://shankarelavarasan.github.io',
      'https://shankarelavarasan.github.io/rapid-saas-ai-store'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the 'docs' directory
app.use(express.static('docs'));

/**
 * @route GET /api/templates
 * @description Get a list of available template files.
 * @access Public
 */
app.get('/api/templates', async (req, res, next) => {
  try {
    const templatesDir = path.join(__dirname, 'docs', 'templates');
    const files = await fs.promises.readdir(templatesDir);
    res.json(files);
  } catch (err) {
    next(new FileProcessingError('Error reading templates directory'));
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Root API endpoint with platform information
app.get('/api', (req, res) => {
  res.json({
    name: 'Rapid AI Store API',
    version: '1.0.0',
    description: 'Global AI Tools Marketplace - The world\'s first comprehensive AI tools distribution platform',
    status: 'operational',
    endpoints: {
      store: '/api/store - AI Store marketplace operations',
      partnership: '/api/partnership - Developer partnerships and revenue sharing',
      payment: '/api/payment - Global payment processing',
      ai: '/api/ask-gemini - AI processing services',
      files: '/api/process-file - File processing',
      github: '/api/github - GitHub integration'
    },
    features: [
      'AI-powered asset generation',
      'Global distribution infrastructure',
      'Multi-currency payment processing',
      'Real-time analytics',
      'Developer partnership program',
      'Quality assurance automation'
    ],
    regions: ['US-East', 'US-West', 'EU-West', 'AP-South', 'AP-Southeast', 'ME-South'],
    uptime: '99.97%',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api', geminiRoutes);
app.use('/api/github', githubRoutes);
app.use('/api', fileRoutes);
app.use('/api', processRoutes);
app.use('/api', exportRoutes);
app.use('/api/store', aiStoreRoutes);
app.use('/api/partnership', partnershipRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling middleware should be the last middleware
app.use(errorHandler);

// Start the HTTP server
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Socket.IO server running`);
});
