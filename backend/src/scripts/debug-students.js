const User = require('../models/User');
const database = require('../config/database');

async function debugStudents() {
    try {
        console.log('1. Connecting to DB...');
        const pool = database.getPool();
        await pool.getConnection();

        // We need an academy_id. Let's find the super admin or an academy admin to get one.
        // Or just pick a user.
        console.log('2. Finding an academy admin...');
        const users = await User.findAll();
        const admin = users.find(u => u.role === 'ACADEMY_ADMIN');

        if (!admin) {
            console.log('No academy admin found. Cannot test findByAcademy.');
            return;
        }

        console.log(`Found admin: ${admin.username}, Academy ID: ${admin.academy_id}`);

        console.log('3. Testing User.findByAcademy...');
        const students = await User.findByAcademy(admin.academy_id, 'STUDENT');
        console.log(`Found ${students.length} students.`);
        console.log('Students:', JSON.stringify(students, null, 2));

    } catch (error) {
        console.error('CAUGHT ERROR:', error);
        console.error('Stack:', error.stack);
    } finally {
        process.exit();
    }
}

debugStudents();
