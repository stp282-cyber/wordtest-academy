const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TestResult {
    static async create(data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO test_results (id, student_id, academy_id, wordbook_id, test_type, score, total_questions, correct_count, wrong_count, is_review, details)
        VALUES (:id, :student_id, :academy_id, :wordbook_id, :test_type, :score, :total_questions, :correct_count, :wrong_count, :is_review, :details)
      `;

            await connection.execute(sql, {
                id: id,
                student_id: data.student_id,
                academy_id: data.academy_id,
                wordbook_id: data.wordbook_id,
                test_type: data.test_type,
                score: data.score,
                total_questions: data.total_questions,
                correct_count: data.correct_count,
                wrong_count: data.wrong_count,
                is_review: data.is_review ? 1 : 0,
                details: JSON.stringify(data.details || {})
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

    static async findByStudent(studentId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM test_results WHERE student_id = :studentId ORDER BY taken_at DESC`,
                { studentId }
            );
            return result.rows.map(row => ({
                ...row,
                details: JSON.parse(row.DETAILS || '{}') // Oracle CLOB handling might need stream reading if large, but for small JSON string it's fine
            }));
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = TestResult;
