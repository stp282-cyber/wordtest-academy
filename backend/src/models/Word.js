// const database = require('../config/database');
const database = require('../config/mockDatabase');
const { v4: uuidv4 } = require('uuid');

class Word {
    static async create(data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO words (id, wordbook_id, english, korean, part_of_speech, example_sentence, difficulty_level, order_index)
        VALUES (:id, :wordbook_id, :english, :korean, :part_of_speech, :example_sentence, :difficulty_level, :order_index)
      `;

            await connection.execute(sql, {
                id: id,
                wordbook_id: data.wordbook_id,
                english: data.english,
                korean: data.korean,
                part_of_speech: data.part_of_speech || null,
                example_sentence: data.example_sentence || null,
                difficulty_level: data.difficulty_level || 1,
                order_index: data.order_index || 0
            });

            await connection.commit();
            return { id, ...data };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByWordbook(wordbookId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM words WHERE wordbook_id = :wordbookId ORDER BY order_index ASC`,
                { wordbookId }
            );
            return result.rows;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async update(id, data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            let sql = 'UPDATE words SET id = id'; // Dummy update to start chain
            const binds = { id };

            if (data.english) { sql += ', english = :english'; binds.english = data.english; }
            if (data.korean) { sql += ', korean = :korean'; binds.korean = data.korean; }
            if (data.example_sentence !== undefined) { sql += ', example_sentence = :example_sentence'; binds.example_sentence = data.example_sentence; }

            sql += ' WHERE id = :id';

            await connection.execute(sql, binds);
            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async delete(id) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            await connection.execute(`DELETE FROM words WHERE id = :id`, [id]);
            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = Word;
