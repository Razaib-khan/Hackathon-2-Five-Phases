// src/config/database.ts
// Database configuration for the AIDO task management application

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// In development, use a global instance to avoid creating multiple connections
// In production, create a new instance each time
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export { prisma };

// Export a function to initialize the database connection
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Connected to database successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

// Export a function to disconnect from the database
export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};