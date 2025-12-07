// Quick test to verify database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('Database info:', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
