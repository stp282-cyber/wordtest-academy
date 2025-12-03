require('dotenv').config();
const db = require('./src/config/database');

(async () => {
    await db.initialize();
    const conn = await db.getPool().getConnection();
    const result = await conn.execute(
        'SELECT column_name FROM user_tab_columns WHERE table_name = :tableName',
        { tableName: 'ACADEMIES' }
    );
    console.log('ACADEMIES table columns:');
    result.rows.forEach(row => console.log(row.COLUMN_NAME));
    await conn.close();
    process.exit(0);
})();
