import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../services/api';

export default function ProjectsWidget() {
  const [projects, setProjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;

    try {
      await createProject({
        name: newName,
        description: newDesc
      });
      setNewName('');
      setNewDesc('');
      setShowAdd(false);
      loadProjects();
    } catch (err) {
      alert('Failed to create project: ' + err.message);
    }
  }

  return (
    <div className="projects-card card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📁 Projects</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--accent-blue)',
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
        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name..."
            style={{
              padding: '0.5rem',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)'
            }}
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description..."
            style={{
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
              background: 'var(--accent-blue)',
              border: 'none',
              color: 'var(--bg-primary)',
              cursor: 'pointer'
            }}
          >
            Add Project
          </button>
        </div>
      )}

      <div>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active projects</p>
        ) : (
          projects.map(project => (
            <div key={project.id} style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {project.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {project.description}
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {project.progress}% complete
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
