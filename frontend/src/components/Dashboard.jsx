import { useState, useEffect } from 'react';
import { getTodaysBriefing, generateBriefing } from '../services/api';
import RemindersWidget from './RemindersWidget';
import ProjectsWidget from './ProjectsWidget';

export default function Dashboard() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </main>
    );
  }

  if (!briefing) {
    return (
      <main className="dashboard">
        <div className="error-state">
          <h2>No briefing found for today</h2>
          <p>Generate your morning brief to get started.</p>
          <button onClick={handleGenerateBriefing}>Generate Morning Brief</button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>PersonalOS</h1>

      {/* Status Brief */}
      <div className="status-brief">
        <div className="indicator">
          <span className="dot green"></span>
          <span className="label">Fresh</span>
        </div>
        <div className="timestamp">{new Date(briefing.generated_at).toLocaleString()}</div>
        <button className="regenerate-btn" onClick={handleGenerateBriefing}>Regenerate</button>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Overview */}
        <div className="overview-card card">
          <h2>📋 Overview</h2>
          <p className="overview-text">{briefing.overview}</p>
        </div>

        {/* Focus & Recommendations */}
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
                    {task.goal_alignment && <span className="badge goal">{task.goal_alignment}</span>}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {briefing.recommendations && briefing.recommendations.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3>Recommendations</h3>
              {briefing.recommendations.map((rec, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  background: 'var(--bg-primary)',
                  borderLeft: '2px solid var(--accent-blue)'
                }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {rec.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {rec.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="schedule-card card">
          <h2>📅 Today's Schedule</h2>
          {briefing.schedule?.available_blocks?.map((block, i) => (
            <div key={i} className="time-block">
              <span className="time">{block.start}-{block.end}</span>
              <span className="label">{block.type.replace('_', ' ')}</span>
              <span className="duration">({block.duration})</span>
            </div>
          ))}
          {briefing.schedule?.appointments?.map((apt, i) => (
            <div key={i} style={{
              padding: '0.75rem',
              marginTop: '0.5rem',
              background: 'var(--bg-primary)',
              borderLeft: '2px solid var(--accent-orange)'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--accent-orange)' }}>{apt.time}</div>
              <div style={{ color: 'var(--text-primary)' }}>{apt.title}</div>
              {apt.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {apt.location}</div>}
            </div>
          ))}
        </div>

        {/* Goal Alignment */}
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

        {/* Reminders & Projects */}
        <RemindersWidget />
        <ProjectsWidget />
      </div>
    </main>
  );
}
