// src/server.ts
// Server entry point for the AIDO task management backend

import { app } from './app';
import { prisma } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});