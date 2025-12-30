import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="app">
      <Dashboard />
      <ChatPanel
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}
