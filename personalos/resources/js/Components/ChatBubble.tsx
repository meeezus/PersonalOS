import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { ChatMessage } from '@/types';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Load existing messages if we have a session
    useEffect(() => {
        if (sessionId) {
            loadMessages();
        }
    }, [sessionId]);

    const loadMessages = async () => {
        try {
            const params = sessionId ? `?session_id=${sessionId}` : '';
            const response = await window.axios.get(`/api/chat/messages${params}`);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
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

            // Update session ID if new
            if (response.data.session_id && !sessionId) {
                setSessionId(response.data.session_id);
            }

            // Add assistant message
            const assistantMsg: ChatMessage = response.data.message;
            setMessages(prev => [...prev.slice(0, -1), { ...tempUserMsg, id: assistantMsg.id - 1 }, assistantMsg]);

        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMsg: ChatMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Connection error. Please check if the agent is running and try again.',
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
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
                    Actions
                </div>
                <div className="space-y-0.5">
                    {metadata.action_results.map((result, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-1.5 text-[10px] font-mono ${
                                result.success ? 'text-emerald-400' : 'text-red-400'
                            }`}
                        >
                            {result.success ? (
                                <CheckCircle size={10} />
                            ) : (
                                <AlertCircle size={10} />
                            )}
                            <span>{result.type.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-50 ${
                    isOpen
                        ? 'bg-white/10 border border-white/20 rotate-0'
                        : 'bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 hover:scale-110'
                }`}
            >
                {isOpen ? (
                    <X size={24} className="text-white/60" />
                ) : (
                    <MessageSquare size={24} className="text-emerald-400" />
                )}
            </button>

            {/* Chat Overlay */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[400px] h-[500px] bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-[#050505]">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                <Bot size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-display font-bold text-white">Iori</h3>
                                <p className="text-[10px] font-mono text-white/40">Context-Aware Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-1.5 hover:bg-white/5 rounded transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 size={14} className="text-white/40 hover:text-red-400" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="p-3 bg-white/5 border border-white/10 rounded mb-3">
                                    <Bot size={24} className="text-white/20" />
                                </div>
                                <p className="text-xs text-white/30 font-mono">
                                    I have full context of your goals and tasks. Ask me anything.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex-shrink-0 w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Bot size={12} className="text-emerald-500" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded px-3 py-2 ${
                                            msg.role === 'user'
                                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                : 'bg-white/5 border border-white/10'
                                        }`}
                                    >
                                        <div className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                                            {msg.content}
                                        </div>
                                        {renderActionResults(msg.metadata)}
                                        <div className="mt-1 text-[9px] font-mono text-white/30">
                                            {formatTime(msg.created_at)}
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
                                <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span className="text-xs font-mono">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/10 bg-[#050505]">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything..."
                                rows={1}
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
