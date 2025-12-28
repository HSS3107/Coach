import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Chat as ChatType, ChatMessage } from '../types/schema';
import { addMessage, getChatForLog } from '../services/db';
import { Send, ArrowLeft, Bot, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';

const Chat: React.FC = () => {
    const { logId } = useParams(); // If present, it's event-bound. If not, global? Or separate route.
    // Actually typically chat is /chat/:chatId or /log/:logId/chat
    // Let's assume /log/:logId/chat for event bound.
    // And /chat/global for global?
    // Current router in main.tsx didn't specify. I'll need to add routes.

    const navigate = useNavigate();
    const { user } = useAuth();
    // Removed useDb

    const [chat, setChat] = useState<ChatType | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Chat
    useEffect(() => {
        const loadChat = async () => {
            if (!user) return;

            let currentChat: ChatType | null = null;

            if (logId) {
                // Event Bound
                currentChat = await getChatForLog(null, logId);
                // If no chat exists for log (shouldn't happen if created on log save), catch it
                if (!currentChat) {
                    // Could create if missing, but LogEvent should have created it.
                    return;
                }
            } else {
                // Global Chat (TODO: Implement getGlobalChat or create if missing)
                // For MVP, limit to event chats or create a "Global" chat record if needed
            }

            setChat(currentChat);
            setLoading(false);
        };
        loadChat();
    }, [user, logId]);

    // Poll Messages
    useEffect(() => {
        if (!chat) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: true });

            if (error) console.error("Error fetching messages:", error);
            else setMessages(data || []);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // Simple poll
        return () => clearInterval(interval);
    }, [chat]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat || !user) return;

        const userContent = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            // 1. Save User Message
            await addMessage(null, chat.id, user.id, 'USER', userContent);

            // Optimistic update (optional, but good for UX - though polling handles it eventually)
            // let's rely on polling or local state append for instant feedback if we wanted

            // 2. Get AI Response
            // We need context: User Profile, Active Goal, Recent Logs
            // Ideally, we fetch these. For MVP, we can fetch active goal here.
            // In a real app, this should be a backend job (Supabase Edge Function) triggered by the DB insert.
            // But we are doing Client-Side AI for speed.

            // Fetch context data
            const { getActiveGoal, getRecentLogs } = await import('../services/db');
            const currentGoal = await getActiveGoal(null, user.id);
            const recentLogs = await getRecentLogs(null, user.id, 5);

            // Construct History from local state + new message
            const history = [
                ...messages.map(m => ({
                    role: (m.sender_type === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
                    content: m.content
                })),
                { role: 'user' as const, content: userContent }
            ];

            const { generateAIResponse } = await import('../services/ai');
            const aiReply = await generateAIResponse(user, currentGoal, recentLogs, history);

            // 3. Save AI Message
            await addMessage(null, chat.id, user.id, 'AI', aiReply);

        } catch (err) {
            console.error(err);
            // Optionally save a system error message
        }
    };

    if (loading) return <div className="p-4">Loading Chat...</div>;
    if (!chat) return <div className="p-4">Chat not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-64px)] -m-4 md:-m-8">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-bg-tertiary bg-bg-secondary">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-bg-tertiary rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="font-bold">{logId ? 'Event Chat' : 'Coach AI'}</h2>
                    <p className="text-xs text-text-secondary">
                        {messages.length > 0 ? 'Active' : 'No messages yet'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary">
                {messages.map((msg) => {
                    const isUser = msg.sender_type === 'USER';
                    return (
                        <div key={msg.id} className={clsx("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                isUser ? "bg-accent-primary" : "bg-status-success"
                            )}>
                                {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>

                            <div className={clsx(
                                "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                                isUser
                                    ? "bg-accent-primary text-white rounded-tr-none"
                                    : "bg-bg-secondary text-text-primary rounded-tl-none border border-bg-tertiary"
                            )}>
                                {msg.content}
                                <div className={clsx("text-xs mt-1 opacity-70", isUser ? "text-blue-100" : "text-text-tertiary")}>
                                    {format(new Date(msg.created_at), 'p')}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-bg-secondary border-t border-bg-tertiary">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        className="input rounded-full px-6"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-accent-primary hover:bg-accent-hover text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
