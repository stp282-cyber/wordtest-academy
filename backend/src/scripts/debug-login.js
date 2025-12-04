const User = require('../models/User');
const database = require('../config/database');
const bcrypt = require('bcrypt');

async function debugLogin(username, password) {
    try {
        console.log(`Attempting login for: ${username}`);

        console.log('1. Finding user...');
        const user = await User.findByUsername(username);
        console.log('User found:', user ? 'Yes' : 'No');

        if (user) {
            console.log('User details:', JSON.stringify(user, null, 2));

            console.log('2. Verifying password...');
            const hash = user.password_hash || user.password;
            console.log('Hash to compare:', hash);

            if (!hash) {
                console.error('ERROR: No password hash found on user object!');
                return;
            }

            const isMatch = await bcrypt.compare(password, hash);
            console.log('Password match:', isMatch);
        } else {
            console.log('User not found in DB');
        }

    } catch (error) {
        console.error('CAUGHT ERROR:', error);
        console.error('Stack:', error.stack);
    } finally {
        process.exit();
    }
}

// Test with the super admin credentials
debugLogin('dds31', 'admin123');
