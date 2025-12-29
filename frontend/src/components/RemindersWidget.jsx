import { useState, useEffect } from 'react';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../services/api';

export default function RemindersWidget() {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState('today');
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    }
  }

  async function handleAdd() {
    if (!newTitle.trim()) return;

    try {
      await createReminder({
        title: newTitle,
        due_date: new Date().toISOString().split('T')[0],
        category: 'today'
      });
      setNewTitle('');
      setShowAdd(false);
      loadReminders();
    } catch (err) {
      alert('Failed to create reminder: ' + err.message);
    }
  }

  async function handleToggle(reminder) {
    try {
      await updateReminder(reminder.id, {
        completed: !reminder.completed
      });
      loadReminders();
    } catch (err) {
      alert('Failed to update reminder: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this reminder?')) return;

    try {
      await deleteReminder(id);
      loadReminders();
    } catch (err) {
      alert('Failed to delete reminder: ' + err.message);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const filteredReminders = reminders.filter(r => {
    if (filter === 'overdue') {
      return r.due_date < today && !r.completed;
    }
    if (filter === 'today') {
      return r.due_date === today && !r.completed;
    }
    if (filter === 'next3') {
      const threeDaysOut = new Date();
      threeDaysOut.setDate(threeDaysOut.getDate() + 3);
      return r.due_date <= threeDaysOut.toISOString().split('T')[0] && !r.completed;
    }
    return true;
  });

  return (
    <div className="reminders-card card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>⏰ Reminders</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--accent-green)',
            border: 'none',
            color: 'var(--bg-primary)',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add
        </button>
      </div>

      {showAdd && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Reminder title..."
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 1,
              padding: '0.5rem',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent-green)',
              border: 'none',
              color: 'var(--bg-primary)',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['overdue', 'today', 'next3'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.25rem 0.75rem',
              background: filter === f ? 'var(--accent-orange)' : 'var(--bg-hover)',
              border: '1px solid var(--border-default)',
              color: filter === f ? 'var(--bg-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {f === 'overdue' ? 'Overdue' : f === 'today' ? 'Today' : 'Next 3 Days'}
          </button>
        ))}
      </div>

      <div>
        {filteredReminders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No reminders</p>
        ) : (
          filteredReminders.map(reminder => (
            <div key={reminder.id} className="list-item">
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => handleToggle(reminder)}
              />
              <div className="list-item-content">
                <div className="list-item-title" style={{ textDecoration: reminder.completed ? 'line-through' : 'none' }}>
                  {reminder.title}
                </div>
                <div className="list-item-meta">{reminder.due_date}</div>
              </div>
              <button
                onClick={() => handleDelete(reminder.id)}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--accent-red)',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
