const User = require('../models/User');
const database = require('../config/database');
const bcrypt = require('bcrypt');

async function resetSuperAdminPassword() {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Find Super Admin
        const result = await connection.execute(
            `SELECT * FROM users WHERE role = 'SUPER_ADMIN'`
        );

        if (result.rows.length > 0) {
            const admin = result.rows[0];
            const username = admin.USERNAME || admin.username;
            const id = admin.ID || admin.id;

            console.log(`Found Super Admin: ${username}`);
            console.log('Resetting password to "admin123"...');

            const passwordHash = await bcrypt.hash('admin123', 10);

            await connection.execute(
                `UPDATE users SET password = :password WHERE id = :id`,
                { password: passwordHash, id: id }
            );
            await connection.commit();

            console.log('Password reset successful.');
            console.log(`Username: ${username}`);
            console.log('New Password: admin123');
        } else {
            console.log('No Super Admin found.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

resetSuperAdminPassword();
