import { format, createLogger } from 'winston';
//import rTracer from 'cls-rtracer';
import 'winston-daily-rotate-file';
const { timestamp, combine, printf } = format;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require('winston');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rTracer = require('cls-rtracer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

function buildLogger() {
  const logFormat = printf(({ level, message, timestamp }) => {
    const requestId = rTracer.id();
    return requestId
      ? `${timestamp} ${level}: [request-id:${requestId}]${message}`
      : `${timestamp}: ${message}`;
  });

  /*const dailyRotateFile = new DailyRotateFile({
    level: process.env.LOG_LEVEL,
    filename: process.env.LOG_FILE_LOCATION,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    handleExceptions: true,
    json: true,
    maxSize: process.env.LOG_FILE_MAX_SIZE,
    maxFiles: process.env.LOG_FILE_MAX_FILES
  })*/

  const logger = createLogger({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      format.errors({ stack: true }),
      logFormat,
    ),

    transports: [
      // new transports.Console(options.console),
      new winston.transports.DailyRotateFile({
        level: process.env.LOG_LEVEL,
        filename: process.env.LOG_FILE_LOCATION,
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        handleExceptions: true,
        json: true,
        maxSize: process.env.LOG_FILE_MAX_SIZE,
        maxFiles: process.env.LOG_FILE_MAX_FILES,
      }),
    ],
    exitOnError: false,
  });
  return logger;
}

module.exports = buildLogger;
