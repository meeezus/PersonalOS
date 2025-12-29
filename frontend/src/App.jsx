import { useState, useEffect } from 'react';
import { getTodaysBriefing, generateBriefing, sendChatMessage } from './services/api';

export default function App() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Good morning! I've read your PersonalOS files. What should we focus on today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadBriefing();
  }, []);

  async function loadBriefing() {
    try {
      setLoading(true);
      const data = await getTodaysBriefing();
      setBriefing(data);
    } catch (err) {
      console.error('Failed to load briefing:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBriefing() {
    try {
      setLoading(true);
      const result = await generateBriefing();
      setBriefing(result.briefing);
    } catch (err) {
      alert('Failed to generate briefing: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const result = await sendChatMessage(chatInput);
      const assistantMsg = { role: 'assistant', content: result.response };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = { role: 'system', content: 'Error: ' + err.message };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="app">
      {/* Dashboard */}
      <main className="dashboard">
        <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>PersonalOS</h1>

        {/* Status */}
        {briefing && (
          <div className="status-brief">
            <div className="indicator">
              <span className="dot green"></span>
              <span className="label">Fresh</span>
            </div>
            <div className="timestamp">{new Date(briefing.generated_at).toLocaleString()}</div>
            <button className="regenerate-btn" onClick={handleGenerateBriefing}>Regenerate</button>
          </div>
        )}

        {/* Overview */}
        {loading && <div className="loading">Loading...</div>}

        {!loading && !briefing && (
          <div className="error-state">
            <h2>No briefing found for today</h2>
            <p>Generate your morning brief to get started.</p>
            <button onClick={handleGenerateBriefing}>Generate Morning Brief</button>
          </div>
        )}

        {briefing && (
          <div className="dashboard-grid">
            <div className="overview-card card">
              <h2>📋 Overview</h2>
              <p className="overview-text">{briefing.overview}</p>
            </div>

            <div className="focus-card card">
              <h2>🎯 Focus & Recommendations</h2>
              <div className="priorities-section">
                <h3>Top Priorities</h3>
                {briefing.priorities?.map((task, i) => (
                  <div key={i} className="priority-item">
                    <input type="checkbox" />
                    <label>
                      <div className="task-header">
                        <span className="task-title">{task.task}</span>
                        <span className="task-time">{task.time_block}</span>
                      </div>
                      <div className="task-why">{task.why}</div>
                      <div className="task-meta">
                        <span className="badge duration">{task.duration}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="schedule-card card">
              <h2>📅 Today's Schedule</h2>
              {briefing.schedule?.available_blocks?.map((block, i) => (
                <div key={i} className="time-block">
                  <span className="time">{block.start}-{block.end}</span>
                  <span className="label">{block.type.replace('_', ' ')}</span>
                  <span className="duration">({block.duration})</span>
                </div>
              ))}
            </div>

            <div className="goals-card card">
              <h2>🎯 Goal Alignment</h2>
              {briefing.goals?.map((goal, i) => (
                <div key={i} className="goal-item">
                  <div className="goal-header">
                    <span className="goal-name">{goal.name}</span>
                    <span className="goal-stats">
                      <span className="current">{goal.current}%</span>
                      <span className="target">[{goal.target}%]</span>
                      <span className={`delta ${goal.delta > 0 ? 'positive' : 'negative'}`}>
                        {goal.delta > 0 ? '+' : ''}{goal.delta}%
                      </span>
                    </span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className={`progress-fill ${goal.status}`} style={{ width: `${goal.current}%` }} />
                      <div className="progress-target" style={{ left: `${goal.target}%` }} />
                    </div>
                  </div>
                  <div className="goal-description">{goal.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Chat Panel */}
      <div className="chat-panel">
        <div className="chat-header">
          <div className="avatar">C</div>
          <div className="status">
            <div className="name">Claude</div>
            <div className="subtitle">PersonalOS Assistant</div>
          </div>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="message assistant">
              <div className="message-content">Thinking...</div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Talk to Claude..."
            disabled={chatLoading}
            rows={3}
          />
          <div className="input-actions">
            <button onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
