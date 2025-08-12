const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

class FirebaseConfig {
  constructor() {
    this.admin = null;
    this.initialize();
  }

  initialize() {
    try {
      let serviceAccount;

      // Option 1: Use environment variables
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        };
      }
      // Option 2: Use service account key file
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        serviceAccount = require(serviceAccountPath);
      } else {
        throw new Error(
          "Firebase configuration not found. Please set environment variables or provide service account key file."
        );
      }

      // Initialize Firebase Admin SDK
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

      console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error.message);
      process.exit(1);
    }
  }

  getAdmin() {
    return this.admin;
  }

  getMessaging() {
    return admin.messaging();
  }
}

module.exports = new FirebaseConfig();
