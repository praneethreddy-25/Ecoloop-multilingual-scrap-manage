import { useState, useEffect, useCallback } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      setIsSupported(true);
      rec.continuous = false;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        setIsListening(false);
        setError(event.error === 'not-allowed'
          ? 'Microphone permission was blocked. Allow microphone access and try again.'
          : 'Voice recognition stopped. Please try again.');
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = useCallback((lang = 'en-US') => {
    if (!recognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (recognition) {
      setError('');
      recognition.lang = lang;
      try {
        recognition.start();
      } catch (error) {
        if (error.name !== 'InvalidStateError') throw error;
      }
      setIsListening(true);
      setTranscript('');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback((text, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { isListening, transcript, error, isSupported, startListening, stopListening, speak };
};
