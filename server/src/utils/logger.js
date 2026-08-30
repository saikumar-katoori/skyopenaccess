import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory path (at root of server folder)
const logsDir = path.resolve(__dirname, "../../logs");

// Ensure log directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Human-readable format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Configure Winston Logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // Rotate and write error level logs
    new DailyRotateFile({
      filename: path.join(logsDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
    // Rotate and write all logs (info, warn, error)
    new DailyRotateFile({
      filename: path.join(logsDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// Always output to Console (essential for Docker logs in Dokploy/ECS/Kubernetes)
logger.add(
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production"
      ? combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json())
      : combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat)
  })
);

// Stream adapter for Morgan HTTP logger integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};
