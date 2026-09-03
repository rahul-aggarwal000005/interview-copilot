# 🎙️ AI Interview Copilot

An advanced, real-time AI Interview Copilot built for candidates to use during remote interviews. The copilot listens to the interviewer's questions via WebSockets, processes the speech using **Deepgram**, and generates highly concise, conversational responses using **Groq (Llama3/GPT-OSS)** for the candidate to read naturally.

## ✨ Features
- **Real-Time Speech-to-Text:** Uses Deepgram's Nova-2 model with aggressive endpointing for ultra-fast, continuous transcription.
- **Smart Speaker Diarization:** Actively filters out background noise and the candidate's own voice, ensuring the LLM only responds to the *Interviewer*.
- **Dynamic AI Persona:** Configurable system prompts allow you to change the AI's "brain" (e.g., Senior Software Engineer vs. KYC Analyst) directly from the UI.
- **Silence Debounce Engine:** Custom frontend Javascript timers prevent sentence splitting by waiting for natural conversational pauses before triggering the LLM.
- **Markdown Editor:** A clean, distraction-free markdown interface for reading the AI's responses naturally.
- **Split Architecture:** Secure Node.js/Express backend to protect API keys, coupled with a blazing-fast React/Vite frontend.

## 🚀 Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, `@uiw/react-md-editor`
* **Backend:** Node.js, Express, `ws` (WebSockets)
* **AI & APIs:** Deepgram (Nova-2 Speech-to-Text), Groq (Fast LLM Inference)

---

## 💻 Local Development

### Prerequisites
You will need API keys for:
1. **Deepgram** (Speech-to-Text): [Create a free account here](https://console.deepgram.com/signup)
2. **Groq** (LLM generation): [Create a free account here](https://console.groq.com/keys)

### Setup
1. Clone the repository.
2. Inside the `server` directory, create a `.env` file based on `.env.example`:
   ```bash
   DEEPGRAM_API_KEY=your_deepgram_key
   GROQ_API_KEY=your_groq_key
   CLIENT_URL=http://localhost:5173
   ```
3. Open two terminals. In the first, run the backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```
4. In the second terminal, run the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
5. Navigate to `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment (Free)

This project is configured for automated, 100% free deployment using **Render** (Backend) and **Vercel** (Frontend).

### 1. Backend (Render.com)
The backend uses WebSockets, so it must be hosted on a platform that supports continuous connections.
- Connect your GitHub repository to Render as a **Blueprint**.
- Render will automatically detect the `render.yaml` file in the root directory.
- Add your `DEEPGRAM_API_KEY` and `GROQ_API_KEY` to the Environment Variables in the Render dashboard.

### 2. Frontend (Vercel.com)
- Import your GitHub repository to Vercel.
- Vercel will automatically detect the `vercel.json` file.
- **Crucial:** Add an Environment Variable named `VITE_WS_URL`. Set the value to your new Render backend URL (e.g., `wss://your-backend.onrender.com`). *Note the `wss://` prefix!*

---

## 🛠️ How it Works
1. The React frontend captures your system microphone and streams raw audio blobs over a WebSocket to the Node.js backend.
2. The backend proxies the audio directly to Deepgram's live streaming API.
3. Deepgram returns interim and final transcripts with speaker diarization tags.
4. The frontend filters out any speaker that isn't the primary interviewer (Speaker 0).
5. Once the interviewer pauses for 1.5 seconds, the frontend ships the compiled transcript history to the backend.
6. The backend queries Groq's high-speed inference engine with the custom AI Persona prompt.
7. The AI's response is streamed back to the frontend's markdown viewer for the candidate to read.
