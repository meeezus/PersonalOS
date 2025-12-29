const API_BASE = 'http://localhost:3001/api';

// Briefing
export async function getTodaysBriefing() {
  const response = await fetch(`${API_BASE}/briefing/today`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch briefing');
  }
  return await response.json();
}

export async function generateBriefing() {
  const response = await fetch(`${API_BASE}/briefing/generate`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to generate briefing');
  return await response.json();
}

// Chat
export async function sendChatMessage(message, sessionId = null) {
  const response = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });
  if (!response.ok) throw new Error('Failed to send message');
  return await response.json();
}

export async function generateEpisodeLog() {
  const response = await fetch(`${API_BASE}/chat/end-day`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to generate episode log');
  return await response.json();
}

// Reminders
export async function getReminders() {
  const response = await fetch(`${API_BASE}/reminders`);
  if (!response.ok) throw new Error('Failed to fetch reminders');
  return await response.json();
}

export async function createReminder(data) {
  const response = await fetch(`${API_BASE}/reminders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create reminder');
  return await response.json();
}

export async function updateReminder(id, data) {
  const response = await fetch(`${API_BASE}/reminders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update reminder');
  return await response.json();
}

export async function deleteReminder(id) {
  const response = await fetch(`${API_BASE}/reminders/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete reminder');
  return await response.json();
}

// Projects
export async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return await response.json();
}

export async function createProject(data) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create project');
  return await response.json();
}

export async function updateProject(id, data) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update project');
  return await response.json();
}

export async function getProjectTasks(projectId) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch project tasks');
  return await response.json();
}
