import app from './app';
import { config } from '@/config/env';
import logger from '@/config/logger';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { startBackgroundJobs } from '@/jobs';

const PORT = config.PORT || 5000;

async function bootstrap() {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Start Background Jobs
    if (config.NODE_ENV !== 'test') {
      startBackgroundJobs();
    }

    // 3. Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 API Server running on port ${PORT} in ${config.NODE_ENV} mode`);
      logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force close after 10s if graceful close takes too long
      setTimeout(() => {
        logger.error('Force shutting down due to timeout...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Fatal error during startup bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
