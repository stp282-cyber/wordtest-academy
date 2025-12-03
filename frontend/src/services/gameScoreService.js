const STORAGE_KEY = 'word_test_academy_scores';
const API_BASE_URL = import.meta.env.VITE_API_URL || null;
const USE_API = !!API_BASE_URL;

// Mock initial data to make it look populated
const INITIAL_SCORES = [
    { id: 1, name: 'Sarah Kim', game: 'Word Match', score: 2450, avatar: '👑', date: Date.now() },
    { id: 2, name: 'Mike Lee', game: 'Speed Typing', score: 2100, avatar: '🥈', date: Date.now() },
    { id: 3, name: 'Jenny Park', game: 'Word Match', score: 1950, avatar: '🥉', date: Date.now() },
    { id: 4, name: 'Tom Chen', game: 'Speed Typing', score: 1800, avatar: '👾', date: Date.now() },
    { id: 5, name: 'Alex Cho', game: 'Word Scramble', score: 1500, avatar: '📚', date: Date.now() },
];

export const getScores = async () => {
    if (USE_API) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/games/scores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) return await response.json();
        } catch (e) {
            console.error('Failed to fetch scores:', e);
        }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SCORES));
        return INITIAL_SCORES;
    }
    return JSON.parse(stored);
};

export const saveScore = async (gameName, score, playerName = 'Student') => {
    if (USE_API) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/games/scores`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game: gameName, score, playerName })
            });
            if (response.ok) return await getScores();
        } catch (e) {
            console.error('Failed to save score:', e);
        }
    }

    const scores = await getScores(); // Now async
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

export const getTopScores = async (limit = 5) => {
    const scores = await getScores();
    return scores.slice(0, limit);
};

export const getAllScores = async () => {
    return await getScores();
};
