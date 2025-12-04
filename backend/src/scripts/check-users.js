const User = require('../models/User');
const database = require('../config/database');

async function checkUsers() {
    try {
        console.log('Checking database connection...');
        const pool = database.getPool();
        // Just trigger a connection check
        await pool.getConnection();

        console.log('Fetching users...');
        const users = await User.findAll();
        console.log(`Found ${users.length} users in the database.`);

        if (users.length > 0) {
            console.log('Existing users:');
            users.forEach(u => {
                console.log(`- Username: ${u.username}, Role: ${u.role}, Name: ${u.full_name}`);
            });
        } else {
            console.log('No users found. You need to create an admin account.');
        }
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        process.exit();
    }
}

checkUsers();
