require('dotenv').config();
const oracledb = require('oracledb');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

async function createDefaultAcademy() {
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

        // UUID 생성
        const academyId = 'academy-default-001';

        // Default Academy 생성
        await connection.execute(
            `INSERT INTO academies (id, name, subdomain, contact_email, contact_phone, address, billing_type, price_per_user, min_usage_days, status, created_by)
             VALUES (:id, :name, :subdomain, :contact_email, :contact_phone, :address, :billing_type, :price_per_user, :min_usage_days, :status, :created_by)`,
            {
                id: academyId,
                name: 'Default Academy',
                subdomain: 'default',
                contact_email: 'admin@default.com',
                contact_phone: '010-0000-0000',
                address: 'Default Address',
                billing_type: 'monthly',
                price_per_user: 10000,
                min_usage_days: 30,
                status: 'active',
                created_by: 'system'
            }
        );

        await connection.commit();

        console.log('✅ Default Academy 생성 완료!');
        console.log('Academy ID:', academyId);
        console.log('Academy Name: Default Academy');

    } catch (err) {
        if (err.errorNum === 1) {
            console.log('⚠️ Default Academy already exists.');
        } else {
            console.error('Error creating default academy:', err);
        }
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

createDefaultAcademy();
