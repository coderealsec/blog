import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

// Bağlantı havuzu limitleri ve zaman aşımı sürelerini arttır
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ['error', 'warn'],
  });

  // Veritabanı bağlantı hatalarını yakala ve yeniden bağlanmayı dene
  client.$on('query', (e) => {
    console.log('Query: ' + e.query);
    console.log('Params: ' + e.params);
    console.log('Duration: ' + e.duration + 'ms');
  });
  
  // Başlangıçta bağlantıyı test et
  client.$connect()
    .then(() => console.log('Successfully connected to database'))
    .catch(e => console.error('Failed to connect to database', e));
  
  return client;
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 