const database = require('./src/config/database');
const oracledb = require('oracledb');
const path = require('path');

// Set TNS_ADMIN for Thin mode
process.env.TNS_ADMIN = path.join(__dirname, 'wallet');

async function checkUsers() {
    try {
        await database.initialize();
        const pool = database.getPool();
        const connection = await pool.getConnection();

        console.log('Connected to Oracle Database');

        const result = await connection.execute('SELECT username, email, role FROM users');
        console.log('Users found:', result.rows);

        await connection.close();
        await database.close();
    } catch (err) {
        console.error('Error checking users:', err);
    }
}

checkUsers();
