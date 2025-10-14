/**
 * @file Winston logger configuration
 * @description Centralized logging with Winston (error, warn, info, debug levels)
 */

import winston from 'winston';
import path from 'path';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';

/**
 * Custom log format combining timestamp and JSON
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Console format for development (more readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) =>
      `${timestamp as string} [${level}]: ${message as string} ${
        Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
      }`
  )
);

/**
 * Winston logger instance
 * Logs to console and files (error.log, combined.log)
 */
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports: [
    // Error logs to separate file
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // All logs to combined file
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'test' ? 'error' : LOG_LEVEL,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Logs an error with stack trace
 * @param message - Error message
 * @param error - Optional error object
 */
export function logError(message: string, error?: Error): void {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message);
  }
}

/**
 * Logs a warning message
 * @param message - Warning message
 * @param meta - Optional metadata
 */
export function logWarn(message: string, meta?: Record<string, unknown>): void {
  logger.warn(message, meta);
}

/**
 * Logs an info message
 * @param message - Info message
 * @param meta - Optional metadata
 */
export function logInfo(message: string, meta?: Record<string, unknown>): void {
  logger.info(message, meta);
}

/**
 * Logs a debug message
 * @param message - Debug message
 * @param meta - Optional metadata
 */
export function logDebug(message: string, meta?: Record<string, unknown>): void {
  logger.debug(message, meta);
}
