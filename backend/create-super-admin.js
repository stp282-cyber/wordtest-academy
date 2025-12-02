require('dotenv').config();
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function createSuperAdmin() {
    let connection;

    try {
        // Oracle DB 연결 (Thin mode)
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

        // 비밀번호 해시화
        const passwordHash = await bcrypt.hash('rudwlschl83', 10);

        // UUID 생성
        const userId = uuidv4();

        // Super Admin 생성
        await connection.execute(
            `INSERT INTO users (id, academy_id, username, password, name, role, email, status)
             VALUES (:id, NULL, :username, :password, :name, :role, :email, 'active')`,
            {
                id: userId,
                username: 'stp282',
                password: passwordHash,
                name: 'Super Administrator',
                role: 'super_admin',
                email: 'stp282@admin.com'
            }
        );

        await connection.commit();

        console.log('✅ Super Admin 생성 완료!');
        console.log('Username: stp282');
        console.log('Password: rudwlschl83');
        console.log('Role: super_admin');

    } catch (err) {
        console.error('Error creating super admin:', err);
        if (connection) {
            await connection.rollback();
        }
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

createSuperAdmin();
