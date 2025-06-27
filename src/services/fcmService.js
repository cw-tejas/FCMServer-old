const firebaseConfig = require("../config/firebase");

class FCMService {
  constructor() {
    this.messaging = firebaseConfig.getMessaging();
  }

  /**
   * Send notification to a single device
   * @param {string} token - FCM registration token
   * @param {Object} notification - Notification payload
   * @param {Object} data - Data payload (optional)
   * @returns {Promise<string>} - Message ID
   */
  async sendToDevice(token, notification, data = {}) {
    try {
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
        },
        data: data,
        apns: {
          payload: {
            aps: {
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log("Successfully sent message:", response);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   * @param {Array<string>} tokens - Array of FCM registration tokens
   * @param {Object} notification - Notification payload
   * @param {Object} data - Data payload (optional)
   * @returns {Promise<Object>} - Batch response
   */
  async sendToMultipleDevices(tokens, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
        },
        data: data,
        tokens: tokens,
        android: {
          notification: {
            icon: "stock_ticker_update",
            color: "#7e55c3",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log("Successfully sent messages:", response);

      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log("List of tokens that caused failures:", failedTokens);
      }

      return response;
    } catch (error) {
      console.error("Error sending messages:", error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} notification - Notification payload
   * @param {Object} data - Data payload (optional)
   * @returns {Promise<string>} - Message ID
   */
  async sendToTopic(topic, notification, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
        },
        data: data,
        android: {
          notification: {
            icon: "stock_ticker_update",
            color: "#7e55c3",
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log("Successfully sent message to topic:", response);
      return response;
    } catch (error) {
      console.error("Error sending message to topic:", error);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   * @param {Array<string>} tokens - Array of FCM registration tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Subscription response
   */
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log("Successfully subscribed to topic:", response);
      return response;
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   * @param {Array<string>} tokens - Array of FCM registration tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} - Unsubscription response
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log("Successfully unsubscribed from topic:", response);
      return response;
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      throw error;
    }
  }

  /**
   * Send data-only message (silent notification)
   * @param {string} token - FCM registration token
   * @param {Object} data - Data payload
   * @returns {Promise<string>} - Message ID
   */
  async sendDataMessage(token, data) {
    try {
      const message = {
        token: token,
        data: data,
        android: {
          priority: "high",
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              "content-available": 1,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log("Successfully sent data message:", response);
      return response;
    } catch (error) {
      console.error("Error sending data message:", error);
      throw error;
    }
  }

  /**
   * Send multiple data-only messages to multiple devices
   * @param {Array<string>} tokens - Array of FCM registration tokens
   * @param {Object} data - Data payload
   * @param {number} count - Number of notifications to send to each device
   * @returns {Promise<Array>} - Array of batch responses
   */
  async sendMultipleDataMessages(tokens, data, count = 1) {
    try {
      const promises = [];

      for (let i = 0; i < count; i++) {
        const message = {
          data: {
            ...data,
            messageIndex: (i + 1).toString(), // Add index to distinguish messages
          },
          tokens: tokens,
          android: {
            priority: "high",
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
            payload: {
              aps: {
                "content-available": 1,
              },
            },
          },
        };

        promises.push(this.messaging.sendEachForMulticast(message));
      }

      const responses = await Promise.all(promises);
      console.log(
        `Successfully sent ${count} data messages to ${tokens.length} devices`
      );

      // Aggregate results
      let totalSuccessCount = 0;
      let totalFailureCount = 0;
      const allFailedTokens = new Set();

      responses.forEach((response, batchIndex) => {
        totalSuccessCount += response.successCount;
        totalFailureCount += response.failureCount;

        if (response.failureCount > 0) {
          response.responses.forEach((resp, tokenIndex) => {
            if (!resp.success) {
              allFailedTokens.add(tokens[tokenIndex]);
            }
          });
        }
      });

      console.log(
        `Total success: ${totalSuccessCount}, Total failures: ${totalFailureCount}`
      );
      if (allFailedTokens.size > 0) {
        console.log("Tokens that failed:", Array.from(allFailedTokens));
      }

      return responses;
    } catch (error) {
      console.error("Error sending multiple data messages:", error);
      throw error;
    }
  }

  /**
   * Send multiple data-only messages to multiple devices with 2-second intervals
   * @param {Array<string>} tokens - Array of FCM registration tokens
   * @param {Object} data - Data payload
   * @param {number} count - Number of notifications to send to each device
   * @returns {Promise<Array>} - Array of batch responses
   */
  async sendMultipleDataMessagesWithInterval(
    tokens,
    data,
    count = 1,
    interval = 2000
  ) {
    try {
      const responses = [];
      let totalSuccessCount = 0;
      let totalFailureCount = 0;
      const allFailedTokens = new Set();

      for (let i = 0; i < count; i++) {
        const message = {
          data: {
            ...data,
            messageIndex: (i + 1).toString(),
            timestamp: new Date().toISOString(),
          },
          tokens: tokens,
          android: {
            priority: "high",
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
            payload: {
              aps: {
                "content-available": 1,
              },
            },
          },
        };

        const response = await this.messaging.sendEachForMulticast(message);
        responses.push(response);

        console.log(`Sent batch ${i + 1}/${count} to ${tokens.length} devices`);

        // Aggregate results
        totalSuccessCount += response.successCount;
        totalFailureCount += response.failureCount;

        if (response.failureCount > 0) {
          response.responses.forEach((resp, tokenIndex) => {
            if (!resp.success) {
              allFailedTokens.add(tokens[tokenIndex]);
            }
          });
        }

        // Wait "interval" milli seconds before sending the next batch
        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      }

      console.log(
        `Completed sending ${count} data messages to ${tokens.length} devices with 2-second intervals`
      );
      console.log(
        `Total success: ${totalSuccessCount}, Total failures: ${totalFailureCount}`
      );
      if (allFailedTokens.size > 0) {
        console.log("Tokens that failed:", Array.from(allFailedTokens));
      }

      return responses;
    } catch (error) {
      console.error(
        "Error sending multiple data messages with interval:",
        error
      );
      throw error;
    }
  }
}

module.exports = new FCMService();
