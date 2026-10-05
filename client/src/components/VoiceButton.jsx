import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function VoiceButton({ onResult, language = 'en-US' }) {
  const { isListening, transcript, error, isSupported, startListening, stopListening } = useVoice();

  React.useEffect(() => {
    if (transcript && !isListening) {
      onResult(transcript);
    }
  }, [transcript, isListening, onResult]);

  return (
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
        onClick={isListening ? stopListening : () => startListening(language)}
        className={`shrink-0 p-4 rounded-full shadow-lg transition-all ${
          isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
      <div className="min-w-0 text-sm">
        <p className={isListening ? 'font-semibold text-red-600' : 'font-semibold text-gray-700'}>
            {isListening ? 'Listening...' : transcript ? 'Voice captured' : isSupported ? 'Tap to speak' : 'Voice unavailable'}
        </p>
        {transcript && <p className="truncate text-gray-600" title={transcript}>{transcript}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
