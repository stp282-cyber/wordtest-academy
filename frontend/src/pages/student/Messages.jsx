import React, { useState } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';

// Mock Data for Student View
const MOCK_MY_MESSAGES = [
    { id: 1, sender: 'teacher', content: '철수야, 이번 주 단어 시험 준비 잘 하고 있니?', timestamp: '2024-06-21 10:00:00' },
    { id: 2, sender: 'student', content: '네, 열심히 하고 있어요!', timestamp: '2024-06-21 10:05:00' },
    { id: 3, sender: 'teacher', content: '모르는 거 있으면 언제든 물어봐.', timestamp: '2024-06-21 10:10:00' }
];

const StudentMessages = () => {
    const [messages, setMessages] = useState(MOCK_MY_MESSAGES);
    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: 'student',
            content: messageInput,
            timestamp: new Date().toLocaleString()
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-black uppercase italic">쪽지함</h1>
                <p className="text-slate-600 font-bold font-mono">선생님과 주고받은 메시지입니다</p>
            </div>

            <div className="flex-1 border-4 border-black bg-white shadow-neo-lg flex flex-col">
                <div className="p-4 border-b-2 border-black bg-yellow-300 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg">선생님</h3>
                            <p className="text-xs text-black/70 font-bold">이스턴영어공부방</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 border-2 border-black shadow-neo-sm ${msg.sender === 'student' ? 'bg-yellow-300 rounded-l-xl rounded-tr-xl' : 'bg-white rounded-r-xl rounded-tl-xl'}`}>
                                <p className="font-bold text-sm leading-relaxed">{msg.content}</p>
                                <p className="text-[10px] text-slate-500 mt-2 text-right font-mono">{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t-4 border-black">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="선생님께 보낼 메시지를 입력하세요..."
                            className="flex-1 px-4 py-3 border-2 border-black focus:outline-none focus:shadow-neo transition-all font-medium"
                        />
                        <Button onClick={handleSendMessage} className="bg-black text-white hover:bg-slate-800 shadow-neo px-6">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentMessages;
