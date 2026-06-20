import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from './env';

// ─────────────────────────────────────────────
// Ensure logs directory exists (skip on Vercel)
// ─────────────────────────────────────────────
const isVercel = process.env.VERCEL === '1';
const logsDir = path.resolve(process.cwd(), 'logs');
if (!isVercel && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ─────────────────────────────────────────────
// Custom Log Format
// ─────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${stackStr}`;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ─────────────────────────────────────────────
// Transports
// ─────────────────────────────────────────────
const transports: winston.transport[] = [];

if (isVercel) {
  // On Vercel, log exclusively to Console (stdout/stderr)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      ),
    })
  );
} else {
  // Local environment or VM/VPS: use local files + optional console logging
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: jsonFormat,
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
      tailable: true,
    })
  );

  if (config.NODE_ENV !== 'production' || process.env.LOG_CONSOLE === 'true') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          logFormat
        ),
      })
    );
  }
}

// ─────────────────────────────────────────────
// Logger Instance
// ─────────────────────────────────────────────
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports,
  exitOnError: false,
  silent: config.NODE_ENV === 'test',
});

// ─────────────────────────────────────────────
// Stream for Morgan HTTP logger
// ─────────────────────────────────────────────
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
