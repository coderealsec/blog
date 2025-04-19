import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

// Bağlantı havuzu limitleri ve zaman aşımı sürelerini arttır
const prismaClientSingleton = () => 
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Bağlantı havuzu ayarlarını optimize et
    log: ['error', 'warn'],
    __internal: {
      engine: {
        connectionLimit: 20,  // Varsayılan: 9
        connectionTimeout: 30000,  // Varsayılan: 10000 (milisaniye)
      },
    },
  });

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 