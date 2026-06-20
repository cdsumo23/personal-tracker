import { PrismaClient } from '@prisma/client';
import { config } from './env';

// ─────────────────────────────────────────────
// Prisma Client Singleton
// ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const isDevelopment = config.NODE_ENV === 'development';

  return new PrismaClient({
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ]
      : [
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ],
  });
};

// Prevent multiple instances of Prisma Client in development (hot-reload)
const prisma = global.__prisma ?? createPrismaClient();

if (config.NODE_ENV === 'development') {
  global.__prisma = prisma;

  // Log queries in development
  (prisma as any).$on('query', (e: any) => {
    console.log(`[Prisma Query] ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
  });
}

/**
 * Connect to the database and verify connectivity.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect from the database.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

export default prisma;
