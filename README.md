# Real-Time Speech-to-Text Application

This is a production-ready Web Application that converts speech to text in real-time using Deepgram's streaming API.

## Architecture

```text
React (Client)                         Node.js (Server)                      Deepgram API
  │                                        │                                      │
  │     1. Start Microphone                │                                      │
  │───────────────────────────────────────>│                                      │
  │                                        │                                      │
  │     2. Connect WebSocket               │                                      │
  │───────────────────────────────────────>│                                      │
  │                                        │    3. Open WebSocket Connection      │
  │                                        │─────────────────────────────────────>│
  │                                        │                                      │
  │     4. Stream Audio Chunks             │                                      │
  │───────────────────────────────────────>│    5. Forward Audio Chunks           │
  │                                        │─────────────────────────────────────>│
  │                                        │                                      │
  │                                        │    6. Return Interim/Final Results   │
  │                                        │<─────────────────────────────────────│
  │     7. Broadcast Transcripts           │                                      │
  │<───────────────────────────────────────│                                      │
  │                                        │                                      │
```

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS v4, HTML5 MediaStream API
**Backend:** Node.js, Express, TypeScript, `ws` (WebSockets), `@deepgram/sdk`

## Prerequisites

- Node.js >= 18
- A Deepgram API key (sign up at [Deepgram](https://console.deepgram.com/))

## Installation & Setup

1. Clone the repository and install all dependencies:
   ```bash
   # Install root dependencies
   npm run install:all
   ```
   Or manually install:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. Configure environment variables in the server:
   ```bash
   cd server
   cp .env.example .env
   ```
   Open `server/.env` and add your `DEEPGRAM_API_KEY`.

## Running the Application

### Running Both Together (Recommended)
From the project root:
```bash
npm run dev
```

### Running Separately

**Backend:**
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`.

**Frontend:**
```bash
cd client
npm run dev
```
The frontend will start on `http://localhost:5173`.

## Security Considerations

- **API Keys:** The Deepgram API key is never exposed to the frontend; all audio is streamed securely through our Node.js backend.
- **Audio Privacy:** Audio chunks are buffered in memory and sent directly to Deepgram; they are never saved to disk.
- **CORS:** Ensure you have correctly configured the `CLIENT_URL` in `.env` for production environments to prevent unauthorized connections.

## Troubleshooting

- **Microphone Permissions:** If the app cannot hear you, check that your browser hasn't blocked microphone permissions for localhost.
- **WebSocket Connection Drops:** This can happen if the Deepgram API key is invalid or expired. Check the server console for error logs.
