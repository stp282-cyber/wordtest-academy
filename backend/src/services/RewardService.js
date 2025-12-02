const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class RewardService {
    static async earnReward(studentId, amount, reason) {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            const sql = `
        INSERT INTO dollar_history (id, student_id, amount, reason)
        VALUES (:id, :studentId, :amount, :reason)
      `;

            await connection.execute(sql, {
                id: uuidv4(),
                studentId,
                amount,
                reason
            });

            await connection.commit();
            return { studentId, amount, reason };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async getBalance(studentId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const sql = `
        SELECT SUM(amount) as balance
        FROM dollar_history
        WHERE student_id = :studentId
      `;
            const result = await connection.execute(sql, { studentId });
            return result.rows[0].BALANCE || 0;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async getHistory(studentId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const sql = `
        SELECT * FROM dollar_history
        WHERE student_id = :studentId
        ORDER BY created_at DESC
      `;
            const result = await connection.execute(sql, { studentId });
            return result.rows;
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = RewardService;
