/**
 * Middleware to validate notification payload
 */
const validateNotificationPayload = (req, res, next) => {
  const { notification } = req.body;

  if (!notification) {
    return res.status(400).json({
      success: false,
      error: "Notification payload is required",
    });
  }

  if (!notification.title || !notification.body) {
    return res.status(400).json({
      success: false,
      error: "Notification title and body are required",
    });
  }

  // Validate title and body length
  if (notification.title.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Notification title must be 100 characters or less",
    });
  }

  if (notification.body.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Notification body must be 1000 characters or less",
    });
  }

  next();
};

/**
 * Middleware to validate FCM tokens
 */
const validateTokens = (req, res, next) => {
  const { tokens } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Tokens array is required and must not be empty",
    });
  }

  if (tokens.length > 500) {
    return res.status(400).json({
      success: false,
      error: "Maximum 500 tokens allowed per request",
    });
  }

  // Validate each token
  for (const token of tokens) {
    if (typeof token !== "string" || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "All tokens must be non-empty strings",
      });
    }
  }

  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.code === "messaging/invalid-registration-token") {
    return res.status(400).json({
      success: false,
      error: "Invalid FCM registration token",
    });
  }

  if (err.code === "messaging/registration-token-not-registered") {
    return res.status(404).json({
      success: false,
      error: "FCM registration token is not registered",
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

module.exports = {
  validateNotificationPayload,
  validateTokens,
  errorHandler,
};
