require('dotenv').config();
const oracledb = require('oracledb');
const path = require('path');

async function testInsert() {
    let connection;

    try {
        const walletLocation = path.join(__dirname, 'wallet');

        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING,
            configDir: walletLocation,
            walletLocation: walletLocation,
            walletPassword: process.env.DB_WALLET_PASSWORD
        });

        console.log('Connected to Oracle Database');

        // Test with different column names
        const testQueries = [
            'SELECT * FROM users WHERE ROWNUM = 1',
            'SELECT column_name FROM user_tab_columns WHERE table_name = \'USERS\' ORDER BY column_id',
        ];

        for (const query of testQueries) {
            try {
                console.log('\n[QUERY]:', query);
                const result = await connection.execute(query);
                console.log('[RESULT]:');
                console.log(JSON.stringify(result.rows, null, 2));
                if (result.metaData) {
                    console.log('[COLUMNS]:', result.metaData.map(m => m.name));
                }
            } catch (err) {
                console.error('[ERROR]:', err.message);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

testInsert();
