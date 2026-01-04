import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Minimize2 } from 'lucide-react';
import { ChatMessage } from '@/types';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Check connection on mount
    useEffect(() => {
        checkConnection();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const checkConnection = async () => {
        try {
            const response = await fetch('http://localhost:3002/health');
            if (response.ok) {
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('disconnected');
            }
        } catch {
            setConnectionStatus('disconnected');
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        const tempUserMsg: ChatMessage = {
            id: Date.now(),
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const response = await window.axios.post('/api/chat/send', {
                content: userMessage,
                session_id: sessionId,
            });

            if (response.data.session_id && !sessionId) {
                setSessionId(response.data.session_id);
            }

            const assistantMsg: ChatMessage = response.data.message;
            setMessages(prev => [...prev.slice(0, -1), { ...tempUserMsg, id: assistantMsg.id - 1 }, assistantMsg]);
            setConnectionStatus('connected');

        } catch (error: any) {
            console.error('Failed to send message:', error);
            setConnectionStatus('disconnected');
            const errorMsg: ChatMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Connection error. Run: cd agent && npm run dev',
                metadata: { error: error?.message || 'Unknown error' },
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px]">
                                <Bot size={14} className="text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-display font-bold text-white">Iori</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        connectionStatus === 'connected' ? 'bg-emerald-500' :
                                        connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                                    }`}></span>
                                    <p className="text-[10px] font-mono text-white/40">
                                        {connectionStatus === 'connected' ? 'Online' :
                                         connectionStatus === 'disconnected' ? 'Offline' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                            <Minimize2 size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Bot size={32} className="text-white/10 mb-3" />
                                <p className="text-xs text-white/30 font-mono max-w-[200px]">
                                    {connectionStatus === 'disconnected'
                                        ? 'Iori is offline. Run: cd agent && npm run dev'
                                        : 'Ask anything, add tasks, log observations...'}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Bot size={12} className="text-emerald-500" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-lg p-3 ${
                                            msg.role === 'user'
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : 'bg-white/5 border border-white/10'
                                        }`}
                                    >
                                        <div className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="flex-shrink-0 w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center">
                                            <UserIcon size={12} className="text-white/60" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Bot size={12} className="text-emerald-500" />
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                    <Loader2 size={14} className="animate-spin text-white/40" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={connectionStatus === 'disconnected' ? 'Iori is offline...' : 'Message Iori...'}
                                rows={1}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                                disabled={isLoading || connectionStatus === 'disconnected'}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading || connectionStatus === 'disconnected'}
                                className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all z-50 ${
                    isOpen
                        ? 'bg-white/10 border border-white/20 text-white/60'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
            </button>
        </>
    );
}
