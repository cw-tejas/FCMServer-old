const express = require("express");
const fcmService = require("../services/fcmService");
const {
  validateNotificationPayload,
  validateTokens,
} = require("../middleware/validation");

const router = express.Router();

/**
 * @route POST /api/notifications/send-to-device
 * @desc Send notification to a single device
 * @access Public
 */
router.post(
  "/send-to-device",
  validateNotificationPayload,
  async (req, res) => {
    try {
      const { token, notification, data } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: "FCM token is required",
        });
      }

      const response = await fcmService.sendToDevice(token, notification, data);

      res.status(200).json({
        success: true,
        messageId: response,
        message: "Notification sent successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * @route POST /api/notifications/send-to-multiple
 * @desc Send notification to multiple devices
 * @access Public
 */
router.post(
  "/send-to-multiple",
  validateNotificationPayload,
  validateTokens,
  async (req, res) => {
    try {
      const { tokens, notification, data } = req.body;

      const response = await fcmService.sendToMultipleDevices(
        tokens,
        notification,
        data
      );

      res.status(200).json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        message: `${response.successCount} notifications sent successfully`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * @route POST /api/notifications/send-to-topic
 * @desc Send notification to a topic
 * @access Public
 */
router.post("/send-to-topic", validateNotificationPayload, async (req, res) => {
  try {
    const { topic, notification, data } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    const response = await fcmService.sendToTopic(topic, notification, data);

    res.status(200).json({
      success: true,
      messageId: response,
      message: "Notification sent to topic successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/notifications/subscribe-to-topic
 * @desc Subscribe tokens to a topic
 * @access Public
 */
router.post("/subscribe-to-topic", validateTokens, async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    const response = await fcmService.subscribeToTopic(tokens, topic);

    res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `${response.successCount} tokens subscribed to topic successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/notifications/unsubscribe-from-topic
 * @desc Unsubscribe tokens from a topic
 * @access Public
 */
router.post("/unsubscribe-from-topic", validateTokens, async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic is required",
      });
    }

    const response = await fcmService.unsubscribeFromTopic(tokens, topic);

    res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `${response.successCount} tokens unsubscribed from topic successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/notifications/send-data-message
 * @desc Send data-only message (silent notification)
 * @access Public
 */
router.post("/send-data-message", async (req, res) => {
  try {
    const { token, data, priority = "high" } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "FCM token is required",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data payload is required",
      });
    }

    const response = await fcmService.sendDataMessage(token, data, priority);

    res.status(200).json({
      success: true,
      messageId: response,
      message: "Data message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/notifications/send-multiple-data-messages
 * @desc Send multiple data-only messages to multiple devices
 * @access Public
 */
router.post("/send-multiple-data-messages", async (req, res) => {
  try {
    const { tokens, data, count } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tokens are required",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data payload is required",
      });
    }

    const response = await fcmService.sendMultipleDataMessages(
      tokens,
      data,
      count
    );

    res.status(200).json({
      success: true,
      messages: response,
      message: "Multiple data messages sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/send-multiple-data-messages-with-interval", async (req, res) => {
  try {
    const { tokens, data, count, interval } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Tokens are required",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Data payload is required",
      });
    }

    const response = await fcmService.sendMultipleDataMessagesWithInterval(
      tokens,
      data,
      count,
      interval
    );

    res.status(200).json({
      success: true,
      messages: response,
      message: "Multiple data messages sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
