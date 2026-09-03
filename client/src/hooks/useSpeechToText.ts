import { useState, useRef, useCallback, useEffect } from "react";
import type { TranscriptionMessage, ConnectionState, Word } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5001";

export function useSpeechToText(options?: { systemPrompt?: string }) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastSpeakerRef = useRef<number | null>(null);
  const llmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<string>("");
  const systemPromptRef = useRef<string>(options?.systemPrompt || "");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    systemPromptRef.current = options?.systemPrompt || "";
  }, [options?.systemPrompt]);

  const formatWords = (words: Word[], startSpeaker: number | null) => {
    let result = "";
    let currentSpk = startSpeaker;

    words.forEach((w) => {
      // some words might not have a speaker in interim, default to currentSpk or 0
      const spk =
        w.speaker !== undefined
          ? w.speaker
          : currentSpk !== null
            ? currentSpk
            : 0;

      // Ignore any voice that is not Speaker 0 (Rahul). We don't want other background voices transcribed.
      if (spk !== 0) return;

      if (spk !== currentSpk) {
        // Only add newlines if result isn't empty OR startSpeaker wasn't null
        if (result !== "" || currentSpk !== null) {
          result += `\n\n🧑‍💼 INTERVIEWER : `;
        } else {
          result += `🧑‍💼 INTERVIEWER : `;
        }
        currentSpk = spk;
      }
      result += (w.punctuated_word || w.word) + " ";
    });

    return { text: result.trimEnd(), lastSpeaker: currentSpk };
  };

  const startListening = useCallback(async () => {
    if (connectionState === "listening" || connectionState === "connecting")
      return;

    setConnectionState("connecting");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("listening");

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        });

        mediaRecorder.start(250); // Send audio chunks every 250ms
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TranscriptionMessage;

          if (data.type === "error") {
            setErrorMessage(data.text);
            stopListening();
            return;
          }

          if (data.words && data.words.length > 0) {
            const { text, lastSpeaker } = formatWords(
              data.words,
              lastSpeakerRef.current,
            );
            
            // If the chunk was completely filtered out (e.g., it was only Amisha speaking)
            if (text.trim() === "") {
              if (data.type === "final") setInterimTranscript("");
              return;
            }

            // Only clear the timer if Rahul (Speaker 0) is actually speaking!
            // If we receive valid text from him, we restart the silence clock.
            if (llmTimerRef.current) {
              clearTimeout(llmTimerRef.current);
              llmTimerRef.current = null;
            }

            if (data.type === "final") {
              setTranscript(
                (prev) =>
                  prev +
                  (prev && text && !text.startsWith("\n") && prev !== ""
                    ? " "
                    : "") +
                  text,
              );
              lastSpeakerRef.current = lastSpeaker;
              setInterimTranscript("");

              // The user wants every finalized sentence to trigger a response from the AI Guest.
              // We use a debounce timer to wait for 2.5 seconds of absolute silence from Deepgram
              // before triggering the LLM. This prevents sentences from splitting if Deepgram finalizes early.
              if (lastSpeaker === 0) {
                llmTimerRef.current = setTimeout(() => {
                  const thinkingIndicator = "\n\n🤖 JARVIS : 💭 *Thinking...*";
                  
                  setTranscript((prev) => {
                    const newTranscript = prev + thinkingIndicator;

                    fetch(
                      WS_URL.replace("ws://", "http://").replace(
                        "wss://",
                        "https://",
                      ) + "/api/llm",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          question: text, 
                          context: prev,
                          systemPrompt: systemPromptRef.current || undefined
                        }),
                      },
                    )
                      .then((res) => res.json())
                      .then((res) => {
                        if (res.answer) {
                          const answerText = res.answer.trim();
                          setTranscript((p) =>
                            p.replace("💭 *Thinking...*", answerText),
                          );
                        } else {
                          setTranscript((p) =>
                            p.replace(
                              "💭 *Thinking...*",
                              "⚠️ *Sorry, failed to get a response.*",
                            ),
                          );
                        }
                      })
                      .catch((err) => {
                        console.error(err);
                        setTranscript((p) =>
                          p.replace(
                            "💭 *Thinking...*",
                            "⚠️ *Network error while thinking.*",
                          ),
                        );
                      });

                    return newTranscript;
                  });

                  // Force next speaker to be GUEST so Rahul gets tagged again if he speaks
                  lastSpeakerRef.current = 1;
                }, 1500); // Wait 1.5 seconds before firing
              }
            } else if (data.type === "interim") {
              setInterimTranscript(text);
            }
          } else {
            // Fallback if no words provided
            if (data.text.trim() === "") return;
            
            if (llmTimerRef.current) {
              clearTimeout(llmTimerRef.current);
              llmTimerRef.current = null;
            }
            
            if (data.type === "final") {
              setTranscript((prev) => prev + (prev ? " " : "") + data.text);
              setInterimTranscript("");
            } else if (data.type === "interim") {
              setInterimTranscript(data.text);
            }
          }
        } catch (e) {
          console.error("Error parsing message", e);
        }
      };

      ws.onerror = () => {
        setErrorMessage("WebSocket connection error");
        setConnectionState("error");
        stopListening();
      };

      ws.onclose = () => {
        if (connectionState !== "error") {
          setConnectionState("idle");
        }
        stopListening();
      };
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access in your browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        setErrorMessage("No microphone was detected.");
      } else {
        setErrorMessage("Unable to access microphone: " + err.message);
      }
      setConnectionState("error");
    }
  }, [connectionState]);

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    setConnectionState("idle");
    setInterimTranscript("");
    // Optionally reset speaker mapping on stop so it starts fresh next time
    lastSpeakerRef.current = null;
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    lastSpeakerRef.current = null;
  }, []);

  return {
    connectionState,
    transcript,
    setTranscript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearTranscript
  };
}
