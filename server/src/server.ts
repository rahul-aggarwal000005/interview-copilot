import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupWebSocket } from './websocket/socket';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/llm', async (req, res) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const { question, context, systemPrompt: customPrompt } = req.body;

    const defaultPrompt = "You are acting as the internal voice/brain for a candidate interviewing for a KYC and AML role at Saxo Bank. " +
      "The candidate currently works at another firm ('XYZ') in a KYC/AML role and has strong practical experience. " +
      "The input you receive (labeled 🧑‍💼 INTERVIEWER) is the real human interviewer asking a question. " +
      "Your job is to generate the exact response the candidate should say out loud. " +
      "CRITICAL RULES:\n" +
      "1. Speak in the first person ('I').\n" +
      "2. Do NOT use textbook, robotic, or 'bookish' language. Use natural, casual, and authentic spoken language.\n" +
      "3. Keep responses VERY concise (2-4 sentences max). Do not overwhelm the candidate with too much text to read.\n" +
      "4. No bullet points, tables, or complex formatting. Just plain, easy-to-read-aloud conversational text.\n" +
      "5. NEVER act as a text-autocomplete engine. If the interviewer says a single word or fragment, treat it as a topic to briefly discuss or acknowledge, do NOT complete their sentence grammatically.";

    const systemPrompt = customPrompt || defaultPrompt;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Conversation History:\n${context || ''}\n\nRespond to Rahul's latest input: ${question}` }
      ],
      temperature: 0.1,
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (error: any) {
    console.error('LLM error:', error);
    res.status(500).json({ answer: `Error: ${error.message || 'I am having trouble thinking right now.'}` });
  }
});

setupWebSocket(server);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  if (!process.env.DEEPGRAM_API_KEY) {
    console.warn('DEEPGRAM_API_KEY is not configured.');
  }
});
