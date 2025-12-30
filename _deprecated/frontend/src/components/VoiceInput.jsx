import { useState } from 'react';

export default function VoiceInput({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);

  function startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.start();
  }

  return (
    <button
      className={`voice-button ${listening ? 'listening' : ''}`}
      onClick={startListening}
      disabled={disabled || listening}
      title="Voice input"
    >
      {listening ? '🎤' : '🎙️'}
    </button>
  );
}
