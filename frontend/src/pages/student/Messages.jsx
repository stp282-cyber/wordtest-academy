import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, MoreVertical } from 'lucide-react';
import Button from '../../components/common/Button';
import { getTeachers, getConversations, getMessages, sendMessage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

const StudentMessages = () => {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeChatUser) {
            fetchMessages(activeChatUser.id);
        }
    }, [activeChatUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchInitialData = async () => {
        try {
            const [teachersData, conversationsData] = await Promise.all([
                getTeachers(),
                getConversations()
            ]);
            setTeachers(teachersData);
            setConversations(conversationsData);

            // Auto-select first teacher or conversation if available
            if (conversationsData.length > 0) {
                // Find the user details for this conversation
                const lastConvo = conversationsData[0];
                // We need the full user object or at least name to display
                // The conversation object has { userId, name, ... }
                setActiveChatUser({ id: lastConvo.userId, name: lastConvo.name });
            } else if (teachersData.length > 0) {
                setActiveChatUser(teachersData[0]);
            }
        } catch (error) {
            console.error("Failed to fetch messages data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const msgs = await getMessages(userId);
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeChatUser) return;

        try {
            await sendMessage(activeChatUser.id, messageInput);
            setMessageInput('');
            // Refresh messages
            fetchMessages(activeChatUser.id);
            // Refresh conversations list to update last message
            const updatedConversations = await getConversations();
            setConversations(updatedConversations);
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("메시지 전송에 실패했습니다.");
        }
    };

    // Merge teachers and conversations for the sidebar list
    // We want to show all teachers, even if no conversation exists yet
    const sidebarUsers = teachers.map(teacher => {
        const conversation = conversations.find(c => c.userId === teacher.id);
        return {
            ...teacher,
            lastMessage: conversation?.lastMessage,
            lastMessageTime: conversation?.lastMessageTime
        };
    });

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-black uppercase italic">쪽지함</h1>
                <p className="text-slate-600 font-bold font-mono">선생님과 주고받은 메시지입니다</p>
            </div>

            <div className="flex-1 border-4 border-black bg-white shadow-neo-lg flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/3 border-r-4 border-black bg-slate-50 flex flex-col">
                    <div className="p-4 border-b-4 border-black bg-white">
                        <h2 className="font-black text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            대화 목록
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {sidebarUsers.map(user => (
                            <div
                                key={user.id}
                                onClick={() => setActiveChatUser(user)}
                                className={`p-4 border-b-2 border-black cursor-pointer hover:bg-yellow-100 transition-colors ${activeChatUser?.id === user.id ? 'bg-yellow-300' : 'bg-white'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold">{user.full_name || user.name}</span>
                                    {user.lastMessageTime && (
                                        <span className="text-xs text-slate-500 font-mono">
                                            {new Date(user.lastMessageTime).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 truncate font-medium">
                                    {user.lastMessage || "대화를 시작해보세요!"}
                                </p>
                            </div>
                        ))}
                        {sidebarUsers.length === 0 && (
                            <div className="p-8 text-center text-slate-500 font-bold">
                                대화 가능한 선생님이 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-100">
                    {activeChatUser ? (
                        <>
                            <div className="p-4 border-b-4 border-black bg-white flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">{activeChatUser.full_name || activeChatUser.name}</h3>
                                        <p className="text-xs text-black/70 font-bold">선생님</p>
                                    </div>
                                </div>
                                <Button variant="icon">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 border-2 border-black shadow-neo-sm ${msg.isMine ? 'bg-yellow-300 rounded-l-xl rounded-tr-xl' : 'bg-white rounded-r-xl rounded-tl-xl'}`}>
                                            <p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-[10px] text-slate-500 mt-2 text-right font-mono">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t-4 border-black">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="메시지를 입력하세요..."
                                        className="flex-1 px-4 py-3 border-2 border-black focus:outline-none focus:shadow-neo transition-all font-medium"
                                    />
                                    <Button onClick={handleSendMessage} className="bg-black text-white hover:bg-slate-800 shadow-neo px-6">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 font-bold text-xl">
                            대화 상대를 선택해주세요.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentMessages;
