require('dotenv').config();
const oracledb = require('oracledb');
const path = require('path');

async function createCurriculumTable() {
    let connection;

    try {
        const walletPath = path.join(__dirname, 'wallet');
        process.env.TNS_ADMIN = walletPath;

        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING,
            configDir: walletPath,
            walletLocation: walletPath,
            walletPassword: process.env.DB_WALLET_PASSWORD
        });

        console.log('Connected to Oracle Database');

        // Create student_curriculums table
        console.log('Creating student_curriculums table...');
        try {
            await connection.execute(`
                CREATE TABLE student_curriculums (
                    id VARCHAR2(50) PRIMARY KEY,
                    student_id VARCHAR2(50) NOT NULL,
                    curriculum_id VARCHAR2(50) NOT NULL,
                    title VARCHAR2(200) NOT NULL,
                    days NUMBER NOT NULL,
                    start_date DATE NOT NULL,
                    schedule CLOB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_student_curriculum FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ student_curriculums table created.');
        } catch (err) {
            if (err.errorNum === 955) {
                console.log('⚠️ student_curriculums table already exists.');
            } else {
                throw err;
            }
        }

        // Create index
        console.log('Creating index...');
        try {
            await connection.execute(`CREATE INDEX idx_student_curriculums_student ON student_curriculums(student_id)`);
            console.log('✅ idx_student_curriculums_student created.');
        } catch (err) {
            if (err.errorNum !== 955) console.error(err);
        }

        console.log('✅ Database setup completed!');

    } catch (err) {
        console.error('Error setting up database:', err);
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

createCurriculumTable();
