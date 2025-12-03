require('dotenv').config();
const db = require('./src/config/database');

(async () => {
    await db.initialize();
    const conn = await db.getPool().getConnection();
    const result = await conn.execute(
        'SELECT username, email, role, status FROM users WHERE username = :username',
        { username: 'test1' }
    );
    console.log('test1 user info:');
    console.log(result.rows);
    await conn.close();
    process.exit(0);
})();
