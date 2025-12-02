require('dotenv').config();
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');

async function createTables() {
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

        // Read SQL file
        const sqlFile = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');

        // Split by semicolon and execute each statement
        const statements = sqlFile.split(';').filter(s => s.trim().length > 0);

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (trimmed.startsWith('--') || !trimmed) continue;

            try {
                console.log('[INFO] Executing:', trimmed.substring(0, 50) + '...');
                await connection.execute(trimmed);
                await connection.commit();
                console.log('       ✓ Success');
            } catch (err) {
                // Ignore "table already exists" errors
                if (err.errorNum === 955) {
                    console.log('       (Table already exists, skipping)');
                } else {
                    console.error('       ✗ Error:', err.message);
                }
            }
        }

        console.log('\n✅ All tables created successfully!');

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

createTables();
