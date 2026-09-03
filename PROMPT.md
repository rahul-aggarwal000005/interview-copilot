# Build a Production-Ready Speech-to-Text Web App

You are an expert full-stack engineer. Build a complete, working **Speech-to-Text web application** from scratch.

The goal is to create the first working version of a web app that listens to microphone audio and converts speech into text in **real time**.

Use **Node.js** for the backend. Do NOT use Python, FastAPI, NestJS, or Spring Boot.

---

## 1. Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Modern responsive UI
- Web APIs for microphone/audio capture

### Backend

- Node.js
- Express.js
- TypeScript
- WebSocket support
- `@deepgram/sdk`
- dotenv
- cors

### Speech-to-Text

Use **Deepgram real-time Speech-to-Text**.

Use the current Deepgram SDK/API approach and a current suitable Deepgram STT model.

The Deepgram API key MUST remain on the backend.

NEVER expose `DEEPGRAM_API_KEY` in React/client-side code.

---

# 2. Project Structure

Create a clean monorepo-style structure:

```text
speech-to-text/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── websocket/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── package.json
│   ├── .env.example
│   └── ...
│
├── README.md
└── .gitignore
```

Keep frontend and backend clearly separated.

---

# 3. Core User Experience

The application should have a clean, modern interface.

Main screen:

```text
┌──────────────────────────────────────────────┐
│              Speech to Text                  │
│                                              │
│        Turn your voice into text             │
│                                              │
│                 🎙                           │
│                                              │
│              [ Start Listening ]             │
│                                              │
│              00:00                           │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │ Your transcript will appear here...      │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [ Copy ] [ Download ] [ Clear ]              │
└──────────────────────────────────────────────┘
```

The UI should feel like a polished SaaS application, not a basic demo.

---

# 4. Microphone Functionality

Implement microphone access using:

```javascript
navigator.mediaDevices.getUserMedia({
  audio: true,
});
```

When the user clicks:

```text
Start Listening
```

the browser should:

1. Request microphone permission.
2. Start capturing microphone audio.
3. Establish the required connection to the backend.
4. Stream audio to the backend.
5. Backend streams audio to Deepgram.
6. Receive transcription results.
7. Send transcription results back to React.
8. Display the transcript in real time.

When the user clicks:

```text
Stop Listening
```

the audio stream and WebSocket connection should be stopped cleanly.

---

# 5. Real-Time Transcription

The application must support real-time transcription.

Clearly distinguish between:

### Interim transcript

Text that Deepgram is currently predicting.

Example:

```text
I have around three years of...
```

### Final transcript

Text that Deepgram has finalized.

Example:

```text
I have around three years of experience.
```

Interim text should not create duplicate sentences.

When a final result arrives, append it to the transcript correctly.

---

# 6. Backend Architecture

Create a Node.js Express server.

Example responsibilities:

### HTTP

Provide:

```text
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

### WebSocket

Create a WebSocket endpoint for streaming audio.

Architecture:

```text
React
  │
  │ microphone audio
  ▼
Node.js WebSocket Server
  │
  │ audio stream
  ▼
Deepgram
  │
  │ transcript events
  ▼
Node.js
  │
  │ transcript events
  ▼
React
```

Do NOT send the Deepgram API key to the frontend.

---

# 7. Environment Variables

Create:

```text
server/.env.example
```

with:

```env
PORT=5000
DEEPGRAM_API_KEY=your_deepgram_api_key_here
CLIENT_URL=http://localhost:5173
```

The actual `.env` file must be ignored by Git.

Add:

```text
.env
.env.*
!.env.example
```

appropriately to `.gitignore`.

---

# 8. Frontend State

Create clean React state management for:

```text
isListening
isConnecting
isConnected
transcript
interimTranscript
error
recordingDuration
```

Do not put all logic inside `App.tsx`.

Create reusable hooks/components.

For example:

```text
hooks/
  useSpeechToText.ts

components/
  MicButton.tsx
  TranscriptBox.tsx
  RecordingTimer.tsx
  ControlButtons.tsx
  StatusIndicator.tsx
```

---

# 9. Recording Status

Display the current state clearly.

States:

### Idle

```text
Ready to listen
```

### Connecting

```text
Connecting...
```

### Listening

```text
● Listening
```

### Error

```text
Unable to access microphone
```

Use subtle animations while listening.

---

# 10. Recording Timer

When recording starts:

```text
00:00
```

Increment every second:

```text
00:01
00:02
00:03
...
```

Stop the timer when recording stops.

Reset it when the user clears/resets the session.

---

# 11. Transcript Editor

The transcript area should be editable.

Users should be able to:

- Edit text
- Select text
- Copy text
- Clear transcript

Do not make the transcript read-only.

Use a good text editor or textarea/contenteditable implementation.

The transcript should remain readable for long conversations.

---

# 12. Copy Function

Add:

```text
Copy
```

button.

When clicked:

```javascript
navigator.clipboard.writeText(transcript);
```

Show temporary feedback:

```text
Copied!
```

---

# 13. Download Transcript

Add:

```text
Download
```

button.

Download the transcript as:

```text
transcript.txt
```

The downloaded file should contain only the transcript text.

---

# 14. Clear Function

Add:

```text
Clear
```

button.

If transcript exists, optionally show a confirmation before clearing.

Clear:

- transcript
- interim transcript
- timer
- recording state

Do NOT reload the page.

---

# 15. Error Handling

Handle all common errors gracefully.

Examples:

### Microphone denied

Show:

```text
Microphone permission was denied.
Please allow microphone access in your browser settings.
```

### Microphone unavailable

```text
No microphone was detected.
```

### WebSocket failure

```text
Connection lost. Please try again.
```

### Deepgram failure

```text
Speech recognition service is unavailable.
```

### API key missing

Backend should clearly log:

```text
DEEPGRAM_API_KEY is not configured.
```

Never expose secrets to the browser.

---

# 16. Security

Implement basic security best practices.

- Never expose Deepgram API key.
- Validate WebSocket connections.
- Configure CORS using `CLIENT_URL`.
- Do not log API keys.
- Do not store microphone audio permanently.
- Do not store transcripts on the server in V1.
- Add reasonable error handling.
- Clean up WebSocket connections.
- Clean up microphone MediaStreams.
- Prevent multiple simultaneous recording sessions.

---

# 17. UI Design

Make the UI visually polished.

Requirements:

- Responsive
- Desktop-first but mobile-friendly
- Clean typography
- Good spacing
- Rounded cards
- Accessible buttons
- Clear microphone status
- Smooth transitions
- Loading state
- Error state
- Empty state

Use Tailwind CSS.

Do not overdesign it.

The main focus should remain on the transcript.

---

# 18. Accessibility

Implement:

- Proper button labels
- Keyboard navigation
- Focus states
- ARIA labels where appropriate
- Accessible contrast
- Screen-reader-friendly status messages

The microphone button should have an accessible label such as:

```text
Start speech recognition
```

or:

```text
Stop speech recognition
```

depending on its current state.

---

# 19. WebSocket Lifecycle

Implement the WebSocket lifecycle carefully.

When starting:

```text
React
 ↓
Open WebSocket
 ↓
Backend
 ↓
Connect to Deepgram
 ↓
Start microphone
 ↓
Stream audio
```

When stopping:

```text
Stop microphone
 ↓
Stop sending audio
 ↓
Close Deepgram connection
 ↓
Close backend WebSocket
 ↓
Update React state
```

Make sure resources are cleaned up if:

- User closes the browser tab.
- User navigates away.
- WebSocket disconnects unexpectedly.
- Microphone permission changes.
- An error occurs.

---

# 20. Prevent Duplicate Audio Connections

The user must not accidentally create multiple active microphone/WebSocket sessions by clicking Start multiple times.

If already listening:

```text
Do nothing
```

or disable the button.

---

# 21. Browser Compatibility

Use browser APIs that are widely supported.

If the browser does not support the required microphone/audio functionality, display:

```text
Your browser does not support microphone recording.
Please use a modern version of Chrome, Edge, Safari, or Firefox.
```

---

# 22. Development Commands

The root README must explain exactly how to run the application.

Expected commands:

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 23. Root-Level Development

Prefer adding a root-level setup that makes development easy.

If appropriate, use:

```text
npm run dev
```

from the project root to start both client and server.

You may use `concurrently`.

Example:

```text
speech-to-text/
├── package.json
├── client/
└── server/
```

Root command:

```bash
npm run dev
```

should start both applications.

---

# 24. TypeScript

Use TypeScript throughout both frontend and backend.

Avoid:

```typescript
any;
```

unless absolutely necessary.

Create shared types where useful.

For example:

```typescript
type TranscriptionMessage = {
  type: "interim" | "final" | "error";
  text: string;
};
```

---

# 25. Code Quality

Write production-quality code.

Requirements:

- Small reusable functions
- Clear naming
- No unnecessary complexity
- No duplicated logic
- Proper cleanup
- Helpful comments only where needed
- No dead code
- No fake implementations
- No TODO placeholders for core functionality

Do NOT simply create a UI mockup.

The microphone → Node.js → Deepgram → transcript pipeline MUST actually work.

---

# 26. README

Create a detailed README explaining:

1. What the application does
2. Architecture
3. Tech stack
4. Prerequisites
5. Deepgram API key setup
6. Environment variables
7. Installation
8. Running frontend
9. Running backend
10. Running both together
11. How real-time transcription works
12. Troubleshooting microphone permissions
13. Security considerations

Include an architecture diagram using Markdown.

---

# 27. Testing

At minimum, verify:

### Backend

```text
GET /api/health
```

returns HTTP 200.

### Frontend

Verify:

- App loads
- Start button works
- Microphone permission appears
- Recording starts
- Transcript appears
- Interim transcript works
- Final transcript works
- Stop works
- Copy works
- Download works
- Clear works
- Errors are displayed correctly

---

# 28. IMPORTANT: Do Not Build Future Features Yet

Do NOT implement these yet:

- User authentication
- Database
- Payments
- AI summarization
- ChatGPT integration
- Speaker identification
- Voice cloning
- Cloud storage
- User accounts
- Admin dashboard
- Mobile app

Keep V1 focused.

However, structure the code so these features can be added later.

---

# 29. Future Architecture Consideration

The application will eventually become an **interview assistant**.

Future version:

```text
                 Microphone
                     │
                     ▼
              Audio Processing
                     │
                     ▼
              Speaker Detection
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      Interviewer               Me
          │                     │
          ▼                     ▼
       Transcript            Transcript
          │                     │
          └──────────┬──────────┘
                     ▼
                  LLM
                     │
                     ▼
              Suggested Answer
```

For V1, simply produce accurate real-time transcription.

Do not implement speaker identification now.

But don't structure the code in a way that makes adding speaker identification later difficult.

---

# 30. Important Implementation Rule

Before finishing, actually test the complete flow:

```text
Browser microphone
        ↓
React
        ↓
WebSocket
        ↓
Node.js
        ↓
Deepgram
        ↓
Node.js
        ↓
WebSocket
        ↓
React
        ↓
Live transcript
```

Do not claim the application is complete if the Deepgram connection is only mocked.

If there are API/SDK version differences, check the current official Deepgram documentation and use the current supported SDK/API syntax instead of inventing deprecated code.

---

# 31. Final Deliverable

At the end, provide:

```text
✅ Project created
✅ Frontend working
✅ Backend working
✅ Microphone working
✅ WebSocket working
✅ Deepgram connected
✅ Real-time transcription working
✅ Copy working
✅ Download working
✅ Clear working
✅ Error handling working
✅ README created
```

Also provide the exact commands I need to run.

Most importantly:

**Build the actual application, not just the project structure or a UI prototype.**
