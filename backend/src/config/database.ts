import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  });
  console.log('✅ Prisma client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  // Create a dummy client that won't be used if connection fails
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  });
}

export default prisma;
