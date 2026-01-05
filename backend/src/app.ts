// src/app.ts
// Main application file for the AIDO task management backend

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { tagRoutes } from './routes/tagRoutes';
import { subtaskRoutes } from './routes/subtaskRoutes';
import { analyticsRoutes } from './routes/analyticsRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/health', healthRoutes);

// Health check route at root
app.get('/', (req, res) => {
  res.json({ message: 'AIDO Task Management API is running!' });
});

// Error handling middleware
app.use(errorHandler);

export { app };