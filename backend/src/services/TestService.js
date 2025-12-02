const Word = require('../models/Word');

class TestService {
    static async generateTest(wordbookId, type, count) {
        // Fetch words from wordbook
        const words = await Word.findByWordbook(wordbookId);

        // Shuffle and pick 'count' words
        const shuffled = words.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        // Format based on type
        return selected.map(word => {
            if (type === 'typing') {
                return {
                    id: word.id,
                    question: word.korean,
                    answer: word.english, // Hidden in frontend usually, but sent for now or kept in session
                    type: 'typing'
                };
            } else if (type === 'word_order') {
                // Shuffle words in the English sentence (if available) or just the word itself?
                // Requirement says "Sentence word order". Assuming example_sentence exists.
                const sentence = word.example_sentence || word.english;
                const parts = sentence.split(' ').sort(() => 0.5 - Math.random());
                return {
                    id: word.id,
                    question: word.korean,
                    parts: parts,
                    answer: sentence,
                    type: 'word_order'
                };
            }
            return word;
        });
    }

    static gradeTest(answers) {
        // answers: [{ wordId, userAnswer, correctAnswer }]
        let correctCount = 0;
        const results = answers.map(item => {
            const isCorrect = this.checkAnswer(item.userAnswer, item.correctAnswer);
            if (isCorrect) correctCount++;
            return { ...item, isCorrect };
        });

        const score = Math.round((correctCount / answers.length) * 100);
        return {
            score,
            correctCount,
            wrongCount: answers.length - correctCount,
            total: answers.length,
            results
        };
    }

    static checkAnswer(userAnswer, correctAnswer) {
        if (!userAnswer || !correctAnswer) return false;

        // Normalize: remove special chars, lowercase, collapse spaces
        const normalize = (str) => str.replace(/[^\w\s]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

        return normalize(userAnswer) === normalize(correctAnswer);
    }
}

module.exports = TestService;
