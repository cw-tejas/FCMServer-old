const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const notificationRoutes = require("./routes/notifications");
const { errorHandler } = require("./middleware/validation");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FCM Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/notifications", notificationRoutes);

// Default route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FCM Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      notifications: {
        sendToDevice: "POST /api/notifications/send-to-device",
        sendToMultiple: "POST /api/notifications/send-to-multiple",
        sendToTopic: "POST /api/notifications/send-to-topic",
        subscribeToTopic: "POST /api/notifications/subscribe-to-topic",
        unsubscribeFromTopic: "POST /api/notifications/unsubscribe-from-topic",
        sendDataMessage: "POST /api/notifications/send-data-message",
        sendMultipleDataMessages:
          "POST /api/notifications/send-multiple-data-messages",
        sendMultipleDataMessagesWithInterval:
          "POST /api/notifications/send-multiple-data-messages-with-interval",
      },
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`FCM Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
