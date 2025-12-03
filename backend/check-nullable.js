require('dotenv').config();
const db = require('./src/config/database');

(async () => {
    await db.initialize();
    const conn = await db.getPool().getConnection();
    const result = await conn.execute(
        'SELECT column_name, nullable FROM user_tab_columns WHERE table_name = :tableName ORDER BY column_id',
        { tableName: 'USERS' }
    );
    console.log('USERS table columns (NOT NULL check):');
    result.rows.forEach(row => console.log(`${row.COLUMN_NAME}: ${row.NULLABLE === 'N' ? 'NOT NULL' : 'NULLABLE'}`));
    await conn.close();
    process.exit(0);
})();
