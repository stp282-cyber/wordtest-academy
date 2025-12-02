import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Volume2, Upload, Download, Filter, ChevronLeft, ChevronRight, Edit2, X, Check, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const WordbookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wordbook, setWordbook] = useState(null);
    const [words, setWords] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const itemsPerPageOptions = [10, 20, 50, 100];

    // Bulk Delete State
    const [selectedTextbookForDelete, setSelectedTextbookForDelete] = useState('');

    // Inline Editing State
    const [editingWordId, setEditingWordId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        if (id === 'new') {
            setWordbook({
                id: 'new',
                title: '새 단어장',
                description: '새로운 단어장을 생성합니다.',
                level: 'Beginner'
            });
            setWords([]);
            setLoading(false);
            return;
        }

        // Load Wordbook Metadata from LocalStorage
        const savedWordbooks = localStorage.getItem('wordbooks');
        let currentWordbook = null;
        if (savedWordbooks) {
            const wordbooks = JSON.parse(savedWordbooks);
            currentWordbook = wordbooks.find(wb => wb.id.toString() === id);
        }

        if (currentWordbook) {
            setWordbook(currentWordbook);
        } else {
            // Fallback for demo if not found in local storage (e.g. direct link to mock id 1)
            setWordbook({
                id,
                title: '통합 단어장',
                description: '여러 교재의 단어를 통합 관리합니다.',
                level: 'All'
            });
        }

        // Load Words from LocalStorage
        const savedWords = localStorage.getItem(`wordbook_words_${id}`);
        if (savedWords) {
            setWords(JSON.parse(savedWords));
        } else {
            // Initial Mock Data with new schema (including Unit Name)
            setWords([
                { id: 1, textbook: '기초영어', major: 'Chapter 1', minor: 'Unit 1', unitName: '인사하기', number: 1, english: 'Hello', korean: '안녕하세요' },
                { id: 2, textbook: '기초영어', major: 'Chapter 1', minor: 'Unit 1', unitName: '인사하기', number: 2, english: 'Apple', korean: '사과' },
                { id: 3, textbook: '중급영어', major: 'Chapter 2', minor: 'Unit 1', unitName: '도전과제', number: 1, english: 'Challenge', korean: '도전' },
            ]);
        }
        setLoading(false);
    }, [id]);

    // Save words to localStorage whenever they change
    useEffect(() => {
        if (!loading && id !== 'new') {
            localStorage.setItem(`wordbook_words_${id}`, JSON.stringify(words));

            // Also update the word count in the wordbook list metadata
            const savedWordbooks = localStorage.getItem('wordbooks');
            if (savedWordbooks) {
                const wordbooks = JSON.parse(savedWordbooks);
                const updatedWordbooks = wordbooks.map(wb =>
                    wb.id.toString() === id ? { ...wb, count: words.length } : wb
                );
                localStorage.setItem('wordbooks', JSON.stringify(updatedWordbooks));
            }
        }
    }, [words, id, loading]);

    // Handle Wordbook Metadata Save
    const handleSaveWordbook = () => {
        const savedWordbooks = localStorage.getItem('wordbooks');
        let wordbooks = savedWordbooks ? JSON.parse(savedWordbooks) : [];

        if (id === 'new') {
            const newId = Date.now();
            const newWordbook = {
                ...wordbook,
                id: newId,
                count: words.length,
                created: new Date().toISOString().split('T')[0]
            };
            wordbooks.push(newWordbook);
            localStorage.setItem('wordbooks', JSON.stringify(wordbooks));

            // Save words for the new ID
            localStorage.setItem(`wordbook_words_${newId}`, JSON.stringify(words));

            alert('단어장이 생성되었습니다.');
            navigate(`/academy-admin/wordbooks/${newId}`, { replace: true });
        } else {
            const updatedWordbooks = wordbooks.map(wb =>
                wb.id.toString() === id ? { ...wordbook, count: words.length } : wb
            );
            localStorage.setItem('wordbooks', JSON.stringify(updatedWordbooks));
            alert('단어장 정보가 저장되었습니다.');
        }
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = words.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(words.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Excel Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            // Use default sheet_to_json which uses first row as header
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length === 0) {
                alert('데이터가 없습니다.');
                return;
            }

            // Map data based on Korean headers
            const newWords = data.map((row, index) => ({
                id: Date.now() + index,
                textbook: row['교재명'] || row['Textbook'] || '',
                major: row['대단원'] || row['Major'] || '',
                minor: row['소단원'] || row['Minor'] || '',
                unitName: row['단원명'] || row['Unit Name'] || '',
                number: row['번호'] || row['Number'] || '',
                english: row['영어'] || row['English'] || '',
                korean: row['한글'] || row['Korean'] || ''
            }));

            // Filter out empty rows if any essential data is missing (optional, but good for safety)
            const validWords = newWords.filter(w => w.english || w.korean);

            setWords(prev => [...prev, ...validWords]);
            alert(`${validWords.length}개의 단어가 추가되었습니다.`);
        };
        reader.readAsBinaryString(file);
    };

    // Excel Download
    const handleFileDownload = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        // Format data for Excel
        const excelData = words.map(w => ({
            '교재명': w.textbook,
            '대단원': w.major,
            '소단원': w.minor,
            '단원명': w.unitName,
            '번호': w.number,
            '영어': w.english,
            '한글': w.korean
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        XLSX.writeFile(wb, `wordbook_${id}${fileExtension}`);
    };

    // Excel Template Download
    const handleTemplateDownload = () => {
        const fileExtension = '.xlsx';
        const templateData = [
            {
                '교재명': '예시 교재',
                '대단원': 'Chapter 1',
                '소단원': 'Unit 1',
                '단원명': '인사하기',
                '번호': 1,
                '영어': 'Hello',
                '한글': '안녕하세요'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        XLSX.writeFile(wb, `wordbook_template${fileExtension}`);
    };

    // Bulk Delete
    const uniqueTextbooks = [...new Set(words.map(w => w.textbook).filter(Boolean))];

    const handleBulkDelete = () => {
        if (!selectedTextbookForDelete) {
            alert('삭제할 교재를 선택해주세요.');
            return;
        }
        if (window.confirm(`'${selectedTextbookForDelete}' 교재의 모든 단어를 삭제하시겠습니까?`)) {
            const newWords = words.filter(w => w.textbook !== selectedTextbookForDelete);
            setWords(newWords);
            setSelectedTextbookForDelete('');
            setCurrentPage(1); // Reset to first page
            alert('삭제되었습니다.');
        }
    };

    const handleDeleteWord = (wordId) => {
        if (window.confirm('이 단어를 삭제하시겠습니까?')) {
            setWords(words.filter(w => w.id !== wordId));
        }
    };

    // Inline Editing Handlers
    const handleEditClick = (word) => {
        setEditingWordId(word.id);
        setEditFormData(word);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSave = () => {
        setWords(prev => prev.map(w => w.id === editingWordId ? editFormData : w));
        setEditingWordId(null);
        setEditFormData({});
    };

    const handleEditCancel = () => {
        setEditingWordId(null);
        setEditFormData({});
    };

    if (loading) return <div className="p-12 text-center font-bold">단어장 정보를 불러오는 중...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Link to="/academy-admin/wordbooks">
                        <Button variant="secondary" className="p-2 border-2 border-black shadow-neo hover:shadow-neo-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-black uppercase italic">{wordbook.title}</h1>
                        <p className="text-slate-600 font-bold font-mono">{wordbook.description}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleTemplateDownload} className="h-12 bg-white !text-black hover:bg-slate-100 shadow-neo hover:shadow-neo-lg border-black">
                        <FileText className="w-5 h-5 mr-2" /> 양식 다운로드
                    </Button>
                    <label className="cursor-pointer">
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                        <div className="h-12 flex items-center px-4 bg-yellow-300 border-2 border-black shadow-neo hover:shadow-neo-lg font-bold transition-all hover:bg-yellow-400">
                            <Upload className="w-5 h-5 mr-2" /> 엑셀 업로드
                        </div>
                    </label>
                    <Button onClick={handleFileDownload} className="h-12 bg-green-400 text-black hover:bg-green-500 shadow-neo hover:shadow-neo-lg border-black">
                        <Download className="w-5 h-5 mr-2" /> 엑셀 다운로드
                    </Button>
                </div>
            </div>

            {/* Settings Card */}
            <Card className="border-4 border-black shadow-neo bg-white p-4">
                <h3 className="font-black uppercase text-lg mb-4 border-b-2 border-black pb-2">단어장 설정</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                        label="단어장 제목"
                        value={wordbook.title}
                        onChange={(e) => setWordbook({ ...wordbook, title: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-black mb-1 uppercase">난이도</label>
                        <select
                            value={wordbook.level}
                            onChange={(e) => setWordbook({ ...wordbook, level: e.target.value })}
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm bg-white"
                        >
                            <option value="Beginner">초급</option>
                            <option value="Intermediate">중급</option>
                            <option value="Advanced">고급</option>
                            <option value="All">통합</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-black mb-1 uppercase">설명</label>
                        <input
                            className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-neo-sm"
                            value={wordbook.description}
                            onChange={(e) => setWordbook({ ...wordbook, description: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveWordbook} className="bg-black text-white hover:bg-slate-800 shadow-neo hover:shadow-neo-lg">
                        <Save className="w-5 h-5 mr-2" /> 변경사항 저장
                    </Button>
                </div>
            </Card>

            {/* Controls & Stats */}
            <Card className="border-4 border-black shadow-neo bg-white p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-lg">
                        총 <span className="text-blue-600 font-black text-xl">{words.length}</span>개의 단어
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* Pagination Control */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">페이지당 보기:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border-2 border-black p-1 font-bold focus:outline-none"
                            >
                                {itemsPerPageOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}개</option>
                                ))}
                            </select>
                        </div>

                        {/* Bulk Delete Control */}
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedTextbookForDelete}
                                onChange={(e) => setSelectedTextbookForDelete(e.target.value)}
                                className="border-2 border-black p-1 font-bold focus:outline-none w-40"
                            >
                                <option value="">교재 선택...</option>
                                {uniqueTextbooks.map(tb => (
                                    <option key={tb} value={tb}>{tb}</option>
                                ))}
                            </select>
                            <Button
                                onClick={handleBulkDelete}
                                size="sm"
                                className="bg-red-500 text-white hover:bg-red-600 border-black"
                                disabled={!selectedTextbookForDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> 일괄 삭제
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Word List Table */}
            <Card className="border-4 border-black shadow-neo-lg bg-white p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white uppercase text-sm font-black">
                                <th className="p-3 border-r-2 border-white w-16 text-center">No.</th>
                                <th className="p-3 border-r-2 border-white">교재명</th>
                                <th className="p-3 border-r-2 border-white">대단원</th>
                                <th className="p-3 border-r-2 border-white">소단원</th>
                                <th className="p-3 border-r-2 border-white">단원명</th>
                                <th className="p-3 border-r-2 border-white w-16 text-center">번호</th>
                                <th className="p-3 border-r-2 border-white">영어</th>
                                <th className="p-3 border-r-2 border-white">한글</th>
                                <th className="p-3 w-24 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="font-bold text-black text-sm">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500">등록된 단어가 없습니다.</td>
                                </tr>
                            ) : (
                                currentItems.map((word, index) => (
                                    <tr key={word.id} className="border-b-2 border-black hover:bg-yellow-50 transition-colors group">
                                        {editingWordId === word.id ? (
                                            <>
                                                <td className="p-3 border-r-2 border-black text-center font-mono">{indexOfFirstItem + index + 1}</td>
                                                <td className="p-1 border-r-2 border-black"><input name="textbook" value={editFormData.textbook} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="major" value={editFormData.major} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="minor" value={editFormData.minor} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="unitName" value={editFormData.unitName} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="number" value={editFormData.number} onChange={handleEditChange} className="w-full p-1 border border-slate-300 text-center" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="english" value={editFormData.english} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 border-r-2 border-black"><input name="korean" value={editFormData.korean} onChange={handleEditChange} className="w-full p-1 border border-slate-300" /></td>
                                                <td className="p-1 text-center flex justify-center gap-1">
                                                    <button onClick={handleEditSave} className="p-1 bg-green-100 hover:bg-green-200 rounded border border-green-500"><Check className="w-4 h-4 text-green-700" /></button>
                                                    <button onClick={handleEditCancel} className="p-1 bg-red-100 hover:bg-red-200 rounded border border-red-500"><X className="w-4 h-4 text-red-700" /></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 border-r-2 border-black text-center font-mono">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="p-3 border-r-2 border-black">{word.textbook}</td>
                                                <td className="p-3 border-r-2 border-black">{word.major}</td>
                                                <td className="p-3 border-r-2 border-black">{word.minor}</td>
                                                <td className="p-3 border-r-2 border-black">{word.unitName}</td>
                                                <td className="p-3 border-r-2 border-black text-center font-mono">{word.number}</td>
                                                <td className="p-3 border-r-2 border-black text-lg">{word.english}</td>
                                                <td className="p-3 border-r-2 border-black">{word.korean}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditClick(word)}
                                                            className="p-1 hover:bg-blue-200 rounded border-2 border-transparent hover:border-black"
                                                        >
                                                            <Edit2 className="w-4 h-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWord(word.id)}
                                                            className="p-1 hover:bg-red-200 rounded border-2 border-transparent hover:border-black"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {words.length > 0 && (
                    <div className="p-4 border-t-4 border-black bg-slate-50 flex justify-center items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border-2 border-black bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-neo-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={`
                                        w-8 h-8 flex items-center justify-center font-black border-2 border-black transition-all
                                        ${currentPage === number ? 'bg-black text-white' : 'bg-white hover:bg-slate-100'}
                                    `}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border-2 border-black bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-neo-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default WordbookDetail;
