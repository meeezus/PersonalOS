import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User as UserIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ChatMessage } from '@/types';

interface IoriChatProps {
    title?: string;
}

export default function IoriChat({ title = "Iori Chat" }: IoriChatProps) {
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

        // Optimistically add user message
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
                content: 'Connection error. Make sure the Iori server is running (npm run dev in agent folder).',
                metadata: { error: error?.message || 'Unknown error' },
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const clearChat = async () => {
        try {
            await window.axios.delete('/api/chat/clear', {
                data: { session_id: sessionId }
            });
            setMessages([]);
            setSessionId(null);
        } catch (error) {
            console.error('Failed to clear chat:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderActionResults = (metadata?: ChatMessage['metadata']) => {
        if (!metadata?.action_results?.length) return null;

        return (
            <div className="mt-2 pt-2 border-t border-white/10">
                <div className="space-y-1">
                    {metadata.action_results.map((result, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 text-[10px] font-mono ${
                                result.success ? 'text-emerald-400' : 'text-red-400'
                            }`}
                        >
                            {result.success ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                            <span>{result.type.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] border border-white/10 rounded-[2px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px]">
                        <Bot size={14} className="text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-display font-bold text-white">{title}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                connectionStatus === 'connected' ? 'bg-emerald-500' :
                                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                            }`}></span>
                            <p className="text-[10px] font-mono text-white/40">
                                {connectionStatus === 'connected' ? 'Connected (API)' :
                                 connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    title="Clear chat"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot size={24} className="text-white/20 mb-2" />
                        <p className="text-xs text-white/30 font-mono">
                            {connectionStatus === 'disconnected'
                                ? 'Run: cd agent && npm run dev'
                                : 'Ask anything...'}
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Bot size={12} className="text-emerald-500" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-[2px] p-3 ${
                                    msg.role === 'user'
                                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                                        : 'bg-white/5 border border-white/10'
                                }`}
                            >
                                <div className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                                    {msg.content}
                                </div>
                                {renderActionResults(msg.metadata)}
                                <div className="mt-1 text-[9px] font-mono text-white/20">
                                    {formatTime(msg.created_at)}
                                </div>
                            </div>
                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-[2px] bg-white/10 border border-white/20 flex items-center justify-center">
                                    <UserIcon size={12} className="text-white/60" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-2 justify-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Bot size={12} className="text-emerald-500" />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-[2px] p-3">
                            <Loader2 size={12} className="animate-spin text-white/40" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message Iori..."
                        rows={1}
                        className="flex-1 bg-white/5 border border-white/10 rounded-[2px] px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                        disabled={isLoading || connectionStatus === 'disconnected'}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading || connectionStatus === 'disconnected'}
                        className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-[2px] text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
