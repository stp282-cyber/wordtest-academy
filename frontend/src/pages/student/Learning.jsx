import React, { useState, useEffect } from 'react';
import { Volume2, ArrowRight, RotateCcw, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import client from '../../api/client';

const Flashcard = ({ word, showMeaning, onFlip }) => (
    <div
        onClick={onFlip}
        className="cursor-pointer perspective-1000 w-full max-w-2xl mx-auto h-96 relative group"
    >
        <div className={`
      w-full h-full transition-all duration-500 preserve-3d relative
      ${showMeaning ? 'rotate-y-180' : ''}
    `}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden">
                <Card className="w-full h-full flex flex-col items-center justify-center border-4 border-black shadow-neo-lg bg-white group-hover:-translate-y-2 transition-transform">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">English Word</span>
                    <h2 className="text-6xl font-black text-black mb-6">{word.english}</h2>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full hover:bg-slate-100"
                        onClick={(e) => { e.stopPropagation(); /* Play audio */ }}
                    >
                        <Volume2 className="w-8 h-8" />
                    </Button>
                    <p className="mt-8 text-slate-400 font-mono text-sm">Click to flip</p>
                </Card>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
                <Card className="w-full h-full flex flex-col items-center justify-center border-4 border-black shadow-neo-lg bg-yellow-50 group-hover:-translate-y-2 transition-transform">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Meaning</span>
                    <h2 className="text-5xl font-black text-black mb-4">{word.korean}</h2>
                    {word.example && (
                        <p className="text-xl text-slate-600 font-medium italic max-w-lg text-center">
                            "{word.example}"
                        </p>
                    )}
                </Card>
            </div>
        </div>
    </div>
);

const Learning = () => {
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMeaning, setShowMeaning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const response = await client.get('/learning/words');
            if (response.data && response.data.length > 0) {
                // Map Oracle uppercase columns to lowercase
                const mappedWords = response.data.map(word => ({
                    id: word.ID || word.id,
                    english: word.ENGLISH || word.english,
                    korean: word.KOREAN || word.korean,
                    example: word.EXAMPLE || word.example
                }));
                setWords(mappedWords);
            } else {
                // Fallback mock data if no words found
                setWords([
                    { english: 'Welcome', korean: '환영합니다', example: 'Welcome to WordTest Academy!' },
                    { english: 'Start', korean: '시작하다', example: 'Let\'s start learning.' }
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch words:', error);
            // Set fallback data on error too
            setWords([
                { english: 'Welcome', korean: '환영합니다', example: 'Welcome to WordTest Academy!' },
                { english: 'Start', korean: '시작하다', example: 'Let\'s start learning.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setShowMeaning(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        } else {
            setIsFinished(true);
        }
    };

    if (loading) return <div className="p-12 text-center font-bold">Loading flashcards...</div>;

    if (isFinished) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <Card className="border-4 border-black shadow-neo-lg p-12 bg-green-50">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-neo">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-black mb-4 uppercase">Great Job!</h2>
                    <p className="text-xl text-slate-600 font-bold mb-8">You've reviewed all {words.length} words.</p>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => window.location.reload()} variant="secondary">
                            <RotateCcw className="w-5 h-5 mr-2" /> Review Again
                        </Button>
                        <Button className="bg-black text-white border-white">
                            Take Test <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-black uppercase italic">Daily Learning</h1>
                <div className="text-xl font-black font-mono bg-white px-4 py-2 border-2 border-black shadow-neo-sm">
                    {currentIndex + 1} / {words.length}
                </div>
            </div>

            <div className="w-full bg-slate-200 h-4 border-2 border-black rounded-full overflow-hidden mb-8">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentIndex) / words.length) * 100}%` }}
                />
            </div>

            <Flashcard
                word={words[currentIndex]}
                showMeaning={showMeaning}
                onFlip={() => setShowMeaning(!showMeaning)}
            />

            <div className="flex justify-center mt-12 gap-4">
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-32"
                    onClick={() => setShowMeaning(!showMeaning)}
                >
                    Flip
                </Button>
                <Button
                    size="lg"
                    className="w-32 bg-black text-white border-white"
                    onClick={handleNext}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Learning;
