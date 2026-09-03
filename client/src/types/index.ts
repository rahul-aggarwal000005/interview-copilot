export type Word = {
  word: string;
  punctuated_word?: string;
  speaker?: number;
};

export type TranscriptionMessage = {
  type: 'interim' | 'final' | 'error';
  text: string;
  words?: Word[];
};

export type ConnectionState = 'idle' | 'connecting' | 'listening' | 'error';
