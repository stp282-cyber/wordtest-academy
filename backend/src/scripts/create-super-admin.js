const User = require('../models/User');
const database = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createSuperAdmin() {
    try {
        const pool = database.getPool();
        const connection = await pool.getConnection();

        // Check if super admin exists
        const result = await connection.execute(
            `SELECT * FROM users WHERE role = 'SUPER_ADMIN'`
        );

        if (result.rows.length > 0) {
            console.log('Super Admin already exists.');
            const admin = result.rows[0];
            console.log(`Username: ${admin.USERNAME || admin.username}`);
            // We can't show password, but we can reset it if needed.
            console.log('If you forgot the password, I can reset it to "admin123".');
        } else {
            console.log('Creating Super Admin...');
            const id = uuidv4();
            const passwordHash = await bcrypt.hash('admin123', 10);

            await connection.execute(
                `INSERT INTO users (id, username, password, name, role, status) 
                 VALUES (:id, :username, :password, :name, :role, 'active')`,
                {
                    id: id,
                    username: 'admin',
                    password: passwordHash,
                    name: 'Super Admin',
                    role: 'SUPER_ADMIN'
                }
            );
            await connection.commit();
            console.log('Super Admin created successfully.');
            console.log('Username: admin');
            console.log('Password: admin123');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

createSuperAdmin();
