const STORAGE_KEY = 'word_test_academy_scores';

// Mock initial data to make it look populated
const INITIAL_SCORES = [
    { id: 1, name: 'Sarah Kim', game: 'Word Match', score: 2450, avatar: '👑', date: Date.now() },
    { id: 2, name: 'Mike Lee', game: 'Speed Typing', score: 2100, avatar: '🥈', date: Date.now() },
    { id: 3, name: 'Jenny Park', game: 'Word Match', score: 1950, avatar: '🥉', date: Date.now() },
    { id: 4, name: 'Tom Chen', game: 'Speed Typing', score: 1800, avatar: '👾', date: Date.now() },
    { id: 5, name: 'Alex Cho', game: 'Word Scramble', score: 1500, avatar: '📚', date: Date.now() },
];

export const getScores = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SCORES));
        return INITIAL_SCORES;
    }
    return JSON.parse(stored);
};

export const saveScore = (gameName, score, playerName = 'Student') => {
    const scores = getScores();
    const newScore = {
        id: Date.now(),
        name: playerName,
        game: gameName,
        score: score,
        avatar: '😎', // Default avatar for current user
        date: Date.now()
    };

    const updatedScores = [...scores, newScore]
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 50); // Keep top 50 only

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
    return updatedScores;
};

export const getTopScores = (limit = 5) => {
    return getScores().slice(0, limit);
};

export const getAllScores = () => {
    return getScores();
};
