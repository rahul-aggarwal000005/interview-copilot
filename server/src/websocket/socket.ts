import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { DeepgramClient } from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config();

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY || "",
});

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket) => {
    console.log("Client connected to WebSocket");
    let keepAliveInterval: NodeJS.Timeout;

    if (!process.env.DEEPGRAM_API_KEY) {
      ws.send(
        JSON.stringify({
          type: "error",
          text: "Deepgram API key not configured on server",
        }),
      );
      return;
    }

    try {
      const deepgramLive = await deepgram.listen.v1.connect({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        interim_results: true,
        diarize: true,
        endpointing: 500,
      });

      let earlyMessages: Buffer[] = [];
      let isOpen = false;

      deepgramLive.on("open", () => {
        console.log("Deepgram connection opened");
        isOpen = true;
        earlyMessages.forEach((msg) => deepgramLive.sendMedia(msg));
        earlyMessages = [];

        keepAliveInterval = setInterval(() => {
          deepgramLive.sendKeepAlive({ type: "KeepAlive" });
        }, 10 * 1000);
      });

      deepgramLive.on("message", (data: any) => {
        if (data.type === "Results") {
          const isFinal = data.is_final;
          const transcript = data.channel.alternatives[0].transcript;
          const words = data.channel.alternatives[0].words || [];

          if (transcript && transcript.length > 0) {
            ws.send(
              JSON.stringify({
                type: isFinal ? "final" : "interim",
                text: transcript,
                words: words,
              }),
            );
          }
        }
      });

      deepgramLive.on("error", (err: any) => {
        console.error("Deepgram error:", err);
        ws.send(
          JSON.stringify({ type: "error", text: "Deepgram connection error" }),
        );
      });

      deepgramLive.on("close", () => {
        console.log("Deepgram connection closed");
        isOpen = false;
        clearInterval(keepAliveInterval);
      });

      deepgramLive.connect();

      ws.on("message", (message: Buffer) => {
        if (isOpen) {
          deepgramLive.sendMedia(message);
        } else {
          earlyMessages.push(message);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected from WebSocket");
        clearInterval(keepAliveInterval);
        try {
          deepgramLive.close();
        } catch (e) {}
      });
    } catch (error) {
      console.error("Failed to create Deepgram connection:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          text: "Failed to connect to speech recognition service",
        }),
      );
    }
  });
}
