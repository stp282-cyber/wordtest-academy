const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function test() {
    try {
        process.env.TNS_ADMIN = path.join(__dirname, 'wallet');
        console.log('TNS_ADMIN:', process.env.TNS_ADMIN);
        console.log('User:', process.env.DB_USER);
        console.log('Connect String:', process.env.DB_CONNECT_STRING);

        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        console.log('Connected successfully!');

        const result = await connection.execute('SELECT * FROM users');
        console.log('Users found:', result.rows.length);

        await connection.close();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

test();
