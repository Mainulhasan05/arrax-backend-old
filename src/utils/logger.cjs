const winston = require("winston");
require("winston-mongodb");
const { createLogger, format, transports } = winston;

const { combine, timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(colorize(), timestamp(), json()),
  transports: [
    // new transports.Console({
    //   format: consoleLogFormat,
    // }),
    // new transports.File({ filename: "app.log" }),
    new transports.MongoDB({
      db: process.env.DB_URL, // MongoDB connection string from .env
      collection: "logs", // Collection where logs will be stored
      level: "info", // Minimum log level to store in MongoDB
      format: combine(timestamp(), json()),
    }),
  ],
});

module.exports = logger;
