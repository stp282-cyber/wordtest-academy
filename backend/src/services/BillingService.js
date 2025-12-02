const database = require('../config/database');

class BillingService {
    static async calculateMonthlyBilling(academyId, yearMonth) {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        try {
            // 1. Get active users count for the month
            // This is a simplified logic. In reality, we might track daily active users or login history.
            // For now, we count users who have 'last_login' in this month or created in this month.
            // Or simply total users if that's the policy. 
            // Let's assume "Active Users" = Users who logged in at least once in the month.

            // Oracle SQL to count active users
            const activeUsersSql = `
        SELECT COUNT(DISTINCT id) as count
        FROM users
        WHERE academy_id = :academyId
        AND (
            TO_CHAR(last_login, 'YYYY-MM') = :yearMonth
            OR 
            TO_CHAR(created_at, 'YYYY-MM') = :yearMonth
        )
      `;

            const userResult = await connection.execute(activeUsersSql, { academyId, yearMonth });
            const activeUsers = userResult.rows[0].COUNT;

            // 2. Calculate usage days (if applicable)
            // For simplicity, let's assume flat rate per user for now, 
            // or we can just store the active user count.

            const pricePerUser = 1000; // Example price
            const amount = activeUsers * pricePerUser;

            // 3. Update or Insert into academy_usage
            const upsertSql = `
        MERGE INTO academy_usage target
        USING (SELECT :id as id, :academy_id as academy_id, :year_month as year_month, :active_users as active_users, :amount as amount FROM dual) source
        ON (target.academy_id = source.academy_id AND target.year_month = source.year_month)
        WHEN MATCHED THEN
          UPDATE SET target.active_users = source.active_users, target.amount = source.amount
        WHEN NOT MATCHED THEN
          INSERT (id, academy_id, year_month, active_users, amount)
          VALUES (source.id, source.academy_id, source.year_month, source.active_users, source.amount)
      `;

            const { v4: uuidv4 } = require('uuid');
            const usageId = uuidv4();

            await connection.execute(upsertSql, {
                id: usageId,
                academy_id: academyId,
                year_month: yearMonth,
                active_users: activeUsers,
                amount: amount
            });

            await connection.commit();

            return {
                academy_id: academyId,
                year_month: yearMonth,
                active_users: activeUsers,
                amount: amount
            };

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async getUsage(academyId, yearMonth) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM academy_usage WHERE academy_id = :academyId AND year_month = :yearMonth`,
                { academyId, yearMonth }
            );
            return result.rows[0];
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = BillingService;
