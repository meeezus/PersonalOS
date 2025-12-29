import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, generateEpisodeLog } from '../services/api';
import VoiceInput from './VoiceInput';

export default function ChatPanel({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Good morning! I've read your identity, goals, latest episode log, and this week's plan.\n\nReady to talk through today's priorities?" }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChatMessage(input, sessionId);

      if (!sessionId) {
        setSessionId(result.sessionId);
      }

      const assistantMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleVoiceTranscript(transcript) {
    setInput(transcript);
  }

  async function handleEndDay() {
    try {
      setLoading(true);
      await generateEpisodeLog();

      const confirmMessage = {
        role: 'system',
        content: "Episode log generated successfully! Your day has been logged to Memory/episode_logs/. Tomorrow's brief will reference it for continuity.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, confirmMessage]);
    } catch (error) {
      console.error('End day error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="avatar">C</div>
        <div className="status">
          <div className="name">Claude</div>
          <div className="subtitle">PersonalOS Assistant</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            {msg.timestamp && (
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content thinking">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        <button onClick={() => setInput("What should I focus on first and why?")}>
          📋 Priority order?
        </button>
        <button onClick={() => setInput("I'm stuck starting this task. Break it into smaller steps?")}>
          ⚡ Help me start
        </button>
        <button onClick={() => setInput("How does my current work align with my goals?")}>
          🎯 Goal alignment?
        </button>
        <button onClick={handleEndDay} disabled={loading}>
          ✅ End day
        </button>
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Talk to Claude..."
          disabled={loading}
          rows={3}
        />

        <div className="input-actions">
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
