import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Send, Trash2, MessageSquare, Bot, User as UserIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { User, ChatMessage } from '@/types';

interface ChatProps {
    auth: {
        user: User;
    };
}

export default function Chat({ auth }: ChatProps) {
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

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

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
            // Add error message
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
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Actions Executed
                </div>
                <div className="space-y-1">
                    {metadata.action_results.map((result, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 text-xs font-mono ${
                                result.success ? 'text-emerald-400' : 'text-red-400'
                            }`}
                        >
                            {result.success ? (
                                <CheckCircle size={12} />
                            ) : (
                                <AlertCircle size={12} />
                            )}
                            <span>{result.type.replace('_', ' ')}</span>
                            {result.task_id && <span className="text-white/30">#{result.task_id}</span>}
                            {result.goal_id && <span className="text-white/30">#{result.goal_id}</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Chat" />

            <div className="flex flex-col h-[calc(100vh-4rem)]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-[2px]">
                            <MessageSquare size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">
                                CHAT
                            </h2>
                            <p className="text-xs font-mono text-white/40">
                                AI Assistant // Context-Aware
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-[2px] text-xs font-mono text-white/60 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                        <Trash2 size={14} />
                        CLEAR
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-[2px] mb-4">
                                <Bot size={32} className="text-white/20" />
                            </div>
                            <h3 className="text-lg font-display text-white/60 mb-2">
                                Ready to assist
                            </h3>
                            <p className="text-sm text-white/30 max-w-md font-mono">
                                I have full context of your goals, tasks, and PersonalOS memory.
                                Ask me anything or tell me to add tasks, log observations, etc.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Bot size={16} className="text-emerald-500" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] rounded-[2px] p-4 ${
                                        msg.role === 'user'
                                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                                            : 'bg-white/5 border border-white/10'
                                    }`}
                                >
                                    <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {renderActionResults(msg.metadata)}
                                    <div className="mt-2 text-[10px] font-mono text-white/30">
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-[2px] bg-white/10 border border-white/20 flex items-center justify-center">
                                        <UserIcon size={16} className="text-white/60" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Bot size={16} className="text-emerald-500" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-[2px] p-4">
                                <div className="flex items-center gap-2 text-white/40">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm font-mono">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/10">
                    <div className="flex gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything, add tasks, log observations..."
                            rows={1}
                            className="flex-1 bg-white/5 border border-white/10 rounded-[2px] px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-[2px] text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-white/30">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
