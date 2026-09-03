import React, { useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';

interface TranscriptBoxProps {
  transcript: string;
  interimTranscript: string;
  setTranscript: (val: string) => void;
}

export function TranscriptBox({ transcript, interimTranscript, setTranscript }: TranscriptBoxProps) {
  const combinedText = transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Target the preview container
    const previewContainer = containerRef.current.querySelector('.w-md-editor-preview');
    if (previewContainer) {
      previewContainer.scrollTop = previewContainer.scrollHeight;
    }
    
    // Target the text area if the user switches to Edit mode
    const textContainer = containerRef.current.querySelector('.w-md-editor-text-input');
    if (textContainer) {
      textContainer.scrollTop = textContainer.scrollHeight;
    }
  }, [combinedText]);

  return (
    <div ref={containerRef} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow" data-color-mode="light">
      <MDEditor
        value={combinedText}
        onChange={(val) => setTranscript(val || '')}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        preview="preview"
        visibleDragbar={false}
        className="border-none shadow-none flex-1"
        style={{ height: '100%' }}
      />
    </div>
  );
}
