import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Plus, Search, Trash2, Edit, Send, User, Calendar, CheckCircle, X } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Mock Data
const MOCK_NOTICES = [
    {
        id: 1,
        title: '여름방학 특강 안내',
        content: '여름방학을 맞아 문법 특강을 진행합니다. 많은 참여 바랍니다.',
        target: 'ALL', // ALL or Class ID
        targetName: '전체',
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        isPermanent: false,
        createdAt: '2024-06-15',
        author: '원장님'
    },
    {
        id: 2,
        title: '중등반 단어 시험 일정 변경',
        content: '다음 주 단어 시험이 월요일에서 화요일로 변경되었습니다.',
        target: 'CLASS_A',
        targetName: '중등 A반',
        startDate: '2024-06-20',
        endDate: '2024-06-25',
        isPermanent: false,
        createdAt: '2024-06-20',
        author: '김선생'
    }
];

const MOCK_THREADS = [
    {
        id: 1,
        studentId: 'std001',
        studentName: '김철수',
        className: '중등 A반',
        unreadCount: 2,
        lastMessage: '선생님, 이번 주 숙제가 뭔가요?',
        lastMessageTime: '10:30 AM',
        messages: [
            { id: 1, sender: 'student', content: '선생님, 이번 주 숙제가 뭔가요?', timestamp: '2024-06-21 10:30:00' },
            { id: 2, sender: 'student', content: '단어장 어디까지 외워야 하죠?', timestamp: '2024-06-21 10:30:05' }
        ]
    },
    {
        id: 2,
        studentId: 'std002',
        studentName: '이영희',
        className: '고등 B반',
        unreadCount: 0,
        lastMessage: '네, 알겠습니다.',
        lastMessageTime: 'Yesterday',
        messages: [
            { id: 1, sender: 'teacher', content: '영희야, 내일 보충수업 잊지마.', timestamp: '2024-06-20 15:00:00' },
            { id: 2, sender: 'student', content: '네, 알겠습니다.', timestamp: '2024-06-20 15:05:00' }
        ]
    }
];

const NoticeMessageManagement = () => {
    const [activeTab, setActiveTab] = useState('notices');
    const [notices, setNotices] = useState(MOCK_NOTICES);
    const [threads, setThreads] = useState(MOCK_THREADS);

    // Notice Modal State
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [noticeForm, setNoticeForm] = useState({
        title: '',
        content: '',
        target: 'ALL',
        startDate: '',
        endDate: '',
        isPermanent: false
    });

    // Message State
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [messageInput, setMessageInput] = useState('');

    const selectedThread = threads.find(t => t.id === selectedThreadId);

    // Handlers for Notices
    const handleOpenNoticeModal = (notice = null) => {
        if (notice) {
            setEditingNotice(notice);
            setNoticeForm({
                title: notice.title,
                content: notice.content,
                target: notice.target,
                startDate: notice.startDate,
                endDate: notice.endDate,
                isPermanent: notice.isPermanent
            });
        } else {
            setEditingNotice(null);
            setNoticeForm({
                title: '',
                content: '',
                target: 'ALL',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                isPermanent: false
            });
        }
        setIsNoticeModalOpen(true);
    };

    const handleSaveNotice = () => {
        if (!noticeForm.title || !noticeForm.content) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        const newNotice = {
            id: editingNotice ? editingNotice.id : Date.now(),
            ...noticeForm,
            targetName: noticeForm.target === 'ALL' ? '전체' : '특정 반 (Mock)', // In real app, look up class name
            createdAt: new Date().toISOString().split('T')[0],
            author: '관리자'
        };

        if (editingNotice) {
            setNotices(notices.map(n => n.id === editingNotice.id ? newNotice : n));
        } else {
            setNotices([newNotice, ...notices]);
        }
        setIsNoticeModalOpen(false);
    };

    const handleDeleteNotice = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            setNotices(notices.filter(n => n.id !== id));
        }
    };

    // Handlers for Messages
    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedThread) return;

        const newMessage = {
            id: Date.now(),
            sender: 'teacher',
            content: messageInput,
            timestamp: new Date().toLocaleString()
        };

        const updatedThreads = threads.map(t => {
            if (t.id === selectedThread.id) {
                return {
                    ...t,
                    messages: [...t.messages, newMessage],
                    lastMessage: messageInput,
                    lastMessageTime: 'Just now'
                };
            }
            return t;
        });

        setThreads(updatedThreads);
        setMessageInput('');
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-black uppercase italic">공지/쪽지 관리</h1>
                <p className="text-slate-600 font-bold font-mono">학원 내 공지사항과 쪽지를 관리하세요</p>
            </div>

            <div className="flex gap-4 border-b-4 border-black pb-1 mb-4 shrink-0">
                <button
                    onClick={() => setActiveTab('notices')}
                    className={`px-6 py-3 font-black text-lg uppercase transition-all ${activeTab === 'notices' ? 'bg-yellow-300 border-2 border-black shadow-neo -mb-3 z-10' : 'text-slate-500 hover:text-black'}`}
                >
                    <Bell className="w-5 h-5 inline-block mr-2" /> 공지사항
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-6 py-3 font-black text-lg uppercase transition-all ${activeTab === 'messages' ? 'bg-yellow-300 border-2 border-black shadow-neo -mb-3 z-10' : 'text-slate-500 hover:text-black'}`}
                >
                    <MessageSquare className="w-5 h-5 inline-block mr-2" /> 쪽지함
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative">
                {activeTab === 'notices' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => handleOpenNoticeModal()} className="bg-black text-white hover:bg-slate-800 shadow-neo">
                                <Plus className="w-5 h-5 mr-2" /> 공지사항 작성
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="space-y-4">
                                {notices.map(notice => (
                                    <Card key={notice.id} className="border-2 border-black shadow-neo p-5 bg-white hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 text-xs font-black border-2 border-black ${notice.target === 'ALL' ? 'bg-blue-200' : 'bg-green-200'}`}>
                                                        {notice.targetName}
                                                    </span>
                                                    {notice.isPermanent && (
                                                        <span className="px-2 py-1 text-xs font-black border-2 border-black bg-red-200">
                                                            상단 고정 (영구)
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-mono text-slate-500">
                                                        {notice.createdAt} • {notice.author}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black mb-2">{notice.title}</h3>
                                                <p className="text-slate-700 whitespace-pre-wrap">{notice.content}</p>
                                                <div className="mt-3 text-sm font-bold text-slate-500 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    게시 기간: {notice.isPermanent ? '영구 게시' : `${notice.startDate} ~ ${notice.endDate}`}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenNoticeModal(notice)} className="p-2 hover:bg-slate-200 rounded border-2 border-transparent hover:border-black transition-all">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 hover:bg-red-100 text-red-500 rounded border-2 border-transparent hover:border-black transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="h-full flex border-4 border-black bg-white shadow-neo-lg">
                        {/* Thread List */}
                        <div className="w-1/3 border-r-4 border-black flex flex-col">
                            <div className="p-4 border-b-2 border-black bg-slate-50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="학생 검색..."
                                        className="w-full pl-9 pr-4 py-2 border-2 border-black focus:outline-none focus:shadow-neo-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {threads.map(thread => (
                                    <div
                                        key={thread.id}
                                        onClick={() => setSelectedThreadId(thread.id)}
                                        className={`p-4 border-b-2 border-slate-200 cursor-pointer hover:bg-yellow-50 transition-colors ${selectedThreadId === thread.id ? 'bg-yellow-100' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-black text-lg">{thread.studentName}</span>
                                            <span className="text-xs font-mono text-slate-500">{thread.lastMessageTime}</span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-500 mb-2">{thread.className}</div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-slate-600 truncate flex-1 mr-2">{thread.lastMessage}</p>
                                            {thread.unreadCount > 0 && (
                                                <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-black">
                                                    {thread.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col bg-slate-50">
                            {selectedThread ? (
                                <>
                                    <div className="p-4 border-b-2 border-black bg-white flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">{selectedThread.studentName}</h3>
                                                <p className="text-xs text-slate-500 font-bold">{selectedThread.className}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {selectedThread.messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-3 border-2 border-black shadow-sm ${msg.sender === 'teacher' ? 'bg-yellow-300 rounded-l-xl rounded-tr-xl' : 'bg-white rounded-r-xl rounded-tl-xl'}`}>
                                                    <p className="font-bold text-sm">{msg.content}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1 text-right">{msg.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-white border-t-2 border-black">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="메시지를 입력하세요..."
                                                className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:shadow-neo-sm"
                                            />
                                            <Button onClick={handleSendMessage} className="bg-black text-white hover:bg-slate-800 shadow-neo px-4">
                                                <Send className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
                                    왼쪽 목록에서 대화 상대를 선택하세요
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Notice Modal */}
            {isNoticeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black shadow-neo-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase">
                                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
                            </h2>
                            <button onClick={() => setIsNoticeModalOpen(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">제목</label>
                                <Input
                                    value={noticeForm.title}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                                    placeholder="공지 제목을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">내용</label>
                                <textarea
                                    value={noticeForm.content}
                                    onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                                    className="w-full h-32 p-3 border-2 border-black focus:outline-none focus:shadow-neo-sm resize-none font-medium"
                                    placeholder="공지 내용을 입력하세요"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">대상</label>
                                    <select
                                        value={noticeForm.target}
                                        onChange={(e) => setNoticeForm({ ...noticeForm, target: e.target.value })}
                                        className="w-full p-2 border-2 border-black focus:outline-none focus:shadow-neo-sm bg-white font-bold"
                                    >
                                        <option value="ALL">전체 학생</option>
                                        <option value="CLASS_A">중등 A반</option>
                                        <option value="CLASS_B">고등 B반</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={noticeForm.isPermanent}
                                            onChange={(e) => setNoticeForm({ ...noticeForm, isPermanent: e.target.checked })}
                                            className="w-5 h-5 border-2 border-black"
                                        />
                                        <span className="font-bold">영구 게시 (상단 고정)</span>
                                    </label>
                                </div>
                            </div>

                            {!noticeForm.isPermanent && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold mb-1">시작일</label>
                                        <Input
                                            type="date"
                                            value={noticeForm.startDate}
                                            onChange={(e) => setNoticeForm({ ...noticeForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">종료일</label>
                                        <Input
                                            type="date"
                                            value={noticeForm.endDate}
                                            onChange={(e) => setNoticeForm({ ...noticeForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t-2 border-slate-100">
                                <Button onClick={() => setIsNoticeModalOpen(false)} className="bg-white border-2 border-slate-300 hover:border-black !text-black">
                                    취소
                                </Button>
                                <Button onClick={handleSaveNotice} className="bg-black text-white hover:bg-slate-800 shadow-neo">
                                    <CheckCircle className="w-5 h-5 mr-2" /> 저장
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeMessageManagement;
