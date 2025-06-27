# FCM Server

<div>
   <img src="https://firebase.google.com/static/docs/cloud-messaging/images/diagram-FCM.png" alt="Sample Image" width="500" height="300">
   <img src="https://miro.medium.com/v2/resize:fit:1100/format:webp/1*SAEqPgTmtd5F2QaqauwiCQ.png" alt="Sample Image" width="500" height="300">
</div>


A Node.js server for sending Firebase Cloud Messaging (FCM) push notifications using the Firebase Admin SDK.

_This server refers to "Trusted Environment" and "Backend" in the above images, respectively_

## Features

- Send notifications to single devices
- Send notifications to multiple devices
- Send notifications to topics
- Subscribe/unsubscribe devices to/from topics
- Send data-only messages (silent notifications)
- Send multiple data messages to multiple devices
- Send multiple data messages with configurable intervals
- Input validation and error handling
- CORS and security headers
- Health check endpoint

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Firebase project with FCM enabled
- Firebase service account key

### Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase configuration:

   **Option 1: Environment Variables**

   - Copy `.env.example` to `.env`
   - Fill in your Firebase project details:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-client-email
     FIREBASE_PRIVATE_KEY=your-private-key
     ```

   **Option 2: Service Account Key File**

   - Download your Firebase service account key JSON file
   - Place it in the `config/` directory
   - Set the path in `.env`:
     ```
     FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
     ```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file or copy the credentials

## Usage

### Start the server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will start on port 3000 by default.

### API Endpoints

#### Health Check

```
GET /health
```

#### Send Notification to Single Device

```
POST /api/notifications/send-to-device
Content-Type: application/json

{
  "token": "FCM_REGISTRATION_TOKEN",
  "notification": {
    "title": "Hello World",
    "body": "This is a test notification",
    "imageUrl": "https://example.com/image.jpg" // optional
  },
  "data": { // optional
    "key1": "value1",
    "key2": "value2"
  }
}
```

#### Send Notification to Multiple Devices

```
POST /api/notifications/send-to-multiple
Content-Type: application/json

{
  "tokens": ["TOKEN1", "TOKEN2", "TOKEN3"],
  "notification": {
    "title": "Hello World",
    "body": "This is a test notification"
  },
  "data": {
    "key1": "value1"
  }
}
```

#### Send Notification to Topic

```
POST /api/notifications/send-to-topic
Content-Type: application/json

{
  "topic": "news",
  "notification": {
    "title": "Breaking News",
    "body": "Important news update"
  },
  "data": {
    "category": "news"
  }
}
```

#### Subscribe to Topic

```
POST /api/notifications/subscribe-to-topic
Content-Type: application/json

{
  "tokens": ["TOKEN1", "TOKEN2"],
  "topic": "news"
}
```

#### Unsubscribe from Topic

```
POST /api/notifications/unsubscribe-from-topic
Content-Type: application/json

{
  "tokens": ["TOKEN1", "TOKEN2"],
  "topic": "news"
}
```

#### Send Data-Only Message

```
POST /api/notifications/send-data-message
Content-Type: application/json

{
  "token": "FCM_REGISTRATION_TOKEN",
  "data": {
    "action": "sync",
    "timestamp": "2023-01-01T00:00:00Z"
  }
}
```

#### Send Multiple Data Messages

```
POST /api/notifications/send-multiple-data-messages
Content-Type: application/json

{
  "tokens": ["TOKEN1", "TOKEN2", "TOKEN3"],
  "data": {
    "action": "bulk_sync",
    "timestamp": "2023-01-01T00:00:00Z"
  },
  "count": 5
}
```

#### Send Multiple Data Messages with Interval

```
POST /api/notifications/send-multiple-data-messages-with-interval
Content-Type: application/json

{
  "tokens": ["TOKEN1", "TOKEN2", "TOKEN3"],
  "data": {
    "action": "scheduled_sync",
    "timestamp": "2023-01-01T00:00:00Z"
  },
  "count": 10,
  "interval": 5000
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "messageId": "MESSAGE_ID",
  "message": "Notification sent successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Handling

The server handles various FCM errors:

- Invalid registration tokens
- Unregistered tokens
- Invalid payloads
- Network errors

## Security

- Helmet.js for security headers
- CORS enabled
- Input validation
- Request size limits

## Environment Variables

| Variable                        | Description                          | Required |
| ------------------------------- | ------------------------------------ | -------- |
| `PORT`                          | Server port (default: 3000)          | No       |
| `NODE_ENV`                      | Environment (development/production) | No       |
| `FIREBASE_PROJECT_ID`           | Firebase project ID                  | Yes\*    |
| `FIREBASE_CLIENT_EMAIL`         | Firebase client email                | Yes\*    |
| `FIREBASE_PRIVATE_KEY`          | Firebase private key                 | Yes\*    |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account key file     | Yes\*    |

\*Either environment variables OR service account key file is required.

## Testing

You can test the endpoints using curl, Postman, or any HTTP client:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test notification
curl -X POST http://localhost:3000/api/notifications/send-to-device \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Hello from FCM Server"
    }
  }'

# Test multiple data messages
curl -X POST http://localhost:3000/api/notifications/send-multiple-data-messages \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["YOUR_FCM_TOKEN"],
    "data": {
      "action": "test"
    },
    "count": 3
  }'
```

## License

MIT
