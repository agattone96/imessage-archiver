import { useEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Archive, Phone, Video, Info, MessageSquare } from 'lucide-react';
import { api } from '../api/client';
import type { Chat, Message } from '../api/types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Messages() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedGuid, setSelectedGuid] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Load Chats
    useEffect(() => {
        api.getRecentChats(searchTerm).then(setChats);
    }, [searchTerm]);

    // Load Messages when chat selected
    useEffect(() => {
        if (!selectedGuid) return;
        api.getChatMessages(selectedGuid, 100).then(msgs => {
            setMessages(msgs); // In reverse order usually
        });
    }, [selectedGuid]);

    const selectedChat = chats.find(c => c.chat_guid === selectedGuid);

    return (
        <div className="flex h-screen bg-bg0 overflow-hidden">
            {/* Pane 2: Thread List */}
            <div className="w-[320px] flex flex-col border-r border-stroke bg-bg0/50 backdrop-blur-xl">
                <div className="p-4 border-b border-stroke">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-panel border border-stroke rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chats.map(chat => (
                        <button
                            key={chat.chat_guid}
                            onClick={() => setSelectedGuid(chat.chat_guid)}
                            className={cn(
                                "w-full text-left p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                selectedGuid === chat.chat_guid ? "bg-white/10" : "hover:bg-white/5"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn("font-medium truncate", selectedGuid === chat.chat_guid ? "text-white" : "text-gray-300")}>
                                    {chat.display_names}
                                </span>
                                <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                                    {chat.last_date ? new Date(chat.last_date).toLocaleDateString() : ''}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted truncate pr-2 w-full">
                                    {chat.msg_count} messages
                                </span>
                                {chat.badges && <span className="text-xs opacity-50">{chat.badges}</span>}
                            </div>
                            {selectedGuid === chat.chat_guid && (
                                <motion.div layoutId="activeChat" className="absolute left-0 top-0 bottom-0 w-1 bg-pink" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pane 3: Thread View */}
            <div className="flex-1 flex flex-col bg-bg1/50 relative">
                {selectedGuid ? (
                    <>
                        {/* Thread Header */}
                        <div className="h-16 border-b border-stroke flex items-center justify-between px-6 bg-bg0/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                                    {selectedChat?.display_names.slice(0, 1)}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white leading-none">{selectedChat?.display_names}</h2>
                                    <p className="text-xs text-muted mt-1">{selectedChat?.msg_count} messages</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-muted">
                                <Phone className="w-5 h-5 hover:text-white cursor-pointer" />
                                <Video className="w-5 h-5 hover:text-white cursor-pointer" />
                                <Info className="w-5 h-5 hover:text-white cursor-pointer" />
                            </div>
                        </div>

                        {/* Messages Area (Virtual Scroll) */}
                        <div className="flex-1 relative">
                            <MessageList messages={messages} />
                        </div>

                        {/* Input Placeholder */}
                        <div className="p-4 border-t border-stroke bg-bg0/50">
                            <div className="bg-panel rounded-2xl p-3 text-muted text-sm border border-stroke flex justify-between items-center opacity-50 cursor-not-allowed">
                                <span>Read-only archive</span>
                                <Archive className="w-4 h-4" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 opacity-30" />
                        </div>
                        <p>Select a conversations to view history.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MessageList({ messages }: { messages: Message[] }) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100, // Estimate row height
        overscan: 5,
    });

    return (
        <div ref={parentRef} className="h-full overflow-y-auto px-4 py-6 space-y-6">
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const msg = messages[virtualRow.index];
                    const isMe = msg.is_from_me;

                    return (
                        <div
                            key={virtualRow.key}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className={cn("flex w-full mb-4 px-4", isMe ? "justify-end" : "justify-start")}
                        >
                            <div className={cn(
                                "max-w-[70%] p-4 rounded-2xl text-sm relative group",
                                isMe
                                    ? "bg-gradient-to-br from-pink to-pink2 text-white rounded-br-none shadow-lg shadow-pink/10"
                                    : "bg-panel border border-stroke text-gray-200 rounded-bl-none"
                            )}>
                                {!isMe && <div className="text-[10px] text-muted mb-1 opacity-50 uppercase tracking-wider">{msg.sender_name}</div>}
                                {msg.text || <span className="italic opacity-50">Attachment / Media</span>}

                                <div className={cn(
                                    "text-[10px] mt-2 opacity-50",
                                    isMe ? "text-pink-100" : "text-gray-500"
                                )}>
                                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
