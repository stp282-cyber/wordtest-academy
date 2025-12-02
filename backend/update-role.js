require('dotenv').config();
const database = require('./src/config/database');

async function updateRole() {
    try {
        await database.initialize();
        const connection = await database.getPool().getConnection();

        console.log('Updating user role to SUPER_ADMIN...');

        await connection.execute(
            `UPDATE users SET role = 'SUPER_ADMIN' WHERE username = 'stp282'`
        );

        await connection.commit();
        console.log('✅ Role updated successfully!');

        // Verify
        const result = await connection.execute(
            `SELECT role FROM users WHERE username = 'stp282'`
        );
        console.log('Current Role:', result.rows[0]);

        await connection.close();
        await database.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

updateRole();
