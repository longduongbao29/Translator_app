import { useState, useEffect, useRef } from 'react';
import { VoiceRecognitionState } from '../types';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (ev: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (ev: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'end', listener: (ev: Event) => void): void;
  addEventListener(type: 'start', listener: (ev: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export const useSpeechRecognition = (language: string = 'en-US') => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    confidence: 0,
  });

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition not supported in this browser',
      }));
      return;
    }


    const recognition = new window.webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let lastConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          lastConfidence = confidence;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState(prev => ({
          ...prev,
          transcript: finalTranscript,
          confidence: lastConfidence,
        }));
      } else if (interimTranscript) {
        setState(prev => ({
          ...prev,
          transcript: interimTranscript,
        }));
      }
    });

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      setState(prev => ({
        ...prev,
        error: event.error,
        isListening: false,
      }));
    });

    recognition.addEventListener('end', () => {
      setState(prev => ({
        ...prev,
        isListening: false,
      }));
    });

    recognition.addEventListener('start', () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: undefined,
      }));
    });

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      // @ts-ignore: check for webkitSpeechRecognition state property
      const rec: any = recognitionRef.current;
      // Only start if not already started (state !== 'recording')
      if (!state.isListening && (!rec.state || rec.state !== 'recording')) {
        setState(prev => ({
          ...prev,
          transcript: '',
          error: undefined,
        }));
        try {
          recognitionRef.current.start();
        } catch (e) {
          // swallow error if already started
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    setState(prev => ({
      ...prev,
      transcript: '',
      confidence: 0,
    }));
  };

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  };
};
