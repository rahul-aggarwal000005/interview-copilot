import React, { useState, useEffect } from 'react';
import { useSpeechToText } from './hooks/useSpeechToText';
import { RecordingTimer } from './components/RecordingTimer';
import { StatusIndicator } from './components/StatusIndicator';
import { TranscriptBox } from './components/TranscriptBox';

const DEFAULT_PROMPT = "You are acting as the internal voice/brain for a candidate interviewing for a KYC and AML role at Saxo Bank. " +
  "The candidate currently works at another firm ('XYZ') in a KYC/AML role and has strong practical experience. " +
  "The input you receive (labeled 🧑‍💼 INTERVIEWER) is the real human interviewer asking a question. " +
  "Your job is to generate the exact response the candidate should say out loud. " +
  "CRITICAL RULES:\n" +
  "1. Speak in the first person ('I').\n" +
  "2. Do NOT use textbook, robotic, or 'bookish' language. Use natural, casual, and authentic spoken language.\n" +
  "3. Keep responses VERY concise (2-4 sentences max). Do not overwhelm the candidate with too much text to read.\n" +
  "4. No bullet points, tables, or complex formatting. Just plain, easy-to-read-aloud conversational text.\n" +
  "5. NEVER act as a text-autocomplete engine. If the interviewer says a single word or fragment, treat it as a topic to briefly discuss or acknowledge, do NOT complete their sentence grammatically.";

function App() {
  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem('systemPrompt') || DEFAULT_PROMPT;
  });
  const [showPromptSettings, setShowPromptSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('systemPrompt', systemPrompt);
  }, [systemPrompt]);

  const {
    connectionState,
    transcript,
    setTranscript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechToText({ systemPrompt });

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Interview Copilot
          </h1>
          <StatusIndicator connectionState={connectionState} errorMessage={errorMessage} />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPromptSettings(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-sm transition-colors shadow-sm border border-gray-300"
          >
            ⚙️ Setup Persona
          </button>

          <RecordingTimer connectionState={connectionState} />
          
          <button 
            onClick={connectionState === 'listening' ? stopListening : startListening}
            className={`px-4 py-2 rounded-md font-medium text-white transition-colors shadow-sm ${
              connectionState === 'listening' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {connectionState === 'listening' ? 'Stop Listening' : 'Start Listening'}
          </button>
          
          <button 
            onClick={clearTranscript}
            disabled={!transcript && !interimTranscript}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 w-full h-full overflow-hidden relative">
        {showPromptSettings && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-gray-200 h-[80vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">⚙️ AI Persona & System Prompt</h2>
                <button onClick={() => setShowPromptSettings(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
              </div>
              <div className="p-6 flex-1 overflow-hidden flex flex-col">
                <p className="text-sm text-gray-500 mb-4">
                  Define exactly how the AI should behave, its background, its tone, and strict rules it must follow. 
                  This is the "brain" of your Interview Copilot.
                </p>
                <textarea
                  className="w-full flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed text-gray-800 shadow-inner resize-none"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt here..."
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  onClick={() => setSystemPrompt(DEFAULT_PROMPT)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Reset to Default
                </button>
                <button 
                  onClick={() => setShowPromptSettings(false)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full h-full flex-1 flex flex-col mx-auto max-w-6xl">
          <TranscriptBox 
            transcript={transcript} 
            interimTranscript={interimTranscript} 
            setTranscript={setTranscript} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
