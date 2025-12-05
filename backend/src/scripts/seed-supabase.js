const database = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    const supabase = database.getClient();

    try {
        // 1. Create Super Admin
        console.log('Creating super admin...');
        const superAdminId = uuidv4();
        const superAdminPassword = await bcrypt.hash('rudwlschl83', 10);

        const { error: adminError } = await supabase
            .from('users')
            .insert([{
                id: superAdminId,
                username: 'stp282',
                email: 'stp282@admin.com',
                password_hash: superAdminPassword,
                full_name: 'Super Admin',
                role: 'SUPER_ADMIN',
                academy_id: null
            }]);

        if (adminError && adminError.code !== '23505') {
            console.error('Super admin creation error:', adminError);
        } else {
            console.log('✅ Super admin created');
        }

        // 2. Create Test Academy
        console.log('Creating test academy...');
        const academyId = uuidv4();

        const { error: academyError } = await supabase
            .from('academies')
            .insert([{
                id: academyId,
                name: 'Test Academy',
                subdomain: 'test-academy',
                status: 'active'
            }]);

        if (academyError && academyError.code !== '23505') {
            console.error('Academy creation error:', academyError);
        } else {
            console.log('✅ Test academy created');
        }

        // 3. Create Academy Settings
        const { error: settingsError } = await supabase
            .from('academy_settings')
            .insert([{
                academy_id: academyId,
                max_students: 50
            }]);

        if (settingsError && settingsError.code !== '23505') {
            console.error('Academy settings error:', settingsError);
        }

        // 4. Create Test Users
        console.log('Creating test users...');
        const studentPassword = await bcrypt.hash('password123', 10);

        const testUsers = [
            {
                id: uuidv4(),
                username: 'admin',
                email: 'admin@academy.com',
                password_hash: studentPassword,
                full_name: 'Academy Admin',
                role: 'ACADEMY_ADMIN',
                academy_id: academyId
            },
            {
                id: uuidv4(),
                username: 'student',
                email: 'student@test.com',
                password_hash: studentPassword,
                full_name: 'John Doe',
                role: 'STUDENT',
                academy_id: academyId
            },
            {
                id: uuidv4(),
                username: 'test1',
                email: 'test1@test.com',
                password_hash: studentPassword,
                full_name: 'Test Student 1',
                role: 'STUDENT',
                academy_id: academyId
            }
        ];

        for (const user of testUsers) {
            const { error } = await supabase.from('users').insert([user]);
            if (error && error.code !== '23505') {
                console.error(`User ${user.username} creation error:`, error);
            }
        }
        console.log('✅ Test users created');

        // 5. Create Sample Wordbooks
        console.log('Creating sample wordbooks...');
        const wordbook1Id = uuidv4();
        const wordbook2Id = uuidv4();

        const wordbooks = [
            {
                id: wordbook1Id,
                academy_id: academyId,
                name: 'Basic Vocabulary',
                description: 'Basic English words for beginners',
                is_shared: false
            },
            {
                id: wordbook2Id,
                academy_id: academyId,
                name: 'Advanced Vocabulary',
                description: 'Advanced English words',
                is_shared: false
            }
        ];

        for (const wb of wordbooks) {
            const { error } = await supabase.from('wordbooks').insert([wb]);
            if (error && error.code !== '23505') {
                console.error(`Wordbook ${wb.name} creation error:`, error);
            }
        }
        console.log('✅ Sample wordbooks created');

        // 6. Create Sample Words
        console.log('Creating sample words...');
        const words = [
            { wordbook_id: wordbook1Id, english: 'hello', korean: '안녕하세요', example_sentence: 'Hello, how are you?', order_index: 0 },
            { wordbook_id: wordbook1Id, english: 'world', korean: '세계', example_sentence: 'The world is beautiful.', order_index: 1 },
            { wordbook_id: wordbook1Id, english: 'computer', korean: '컴퓨터', example_sentence: 'I use a computer every day.', order_index: 2 },
            { wordbook_id: wordbook1Id, english: 'study', korean: '공부하다', example_sentence: 'I study English.', order_index: 3 },
            { wordbook_id: wordbook1Id, english: 'book', korean: '책', example_sentence: 'This is a good book.', order_index: 4 },
            { wordbook_id: wordbook1Id, english: 'school', korean: '학교', example_sentence: 'I go to school.', order_index: 5 },
            { wordbook_id: wordbook1Id, english: 'teacher', korean: '선생님', example_sentence: 'My teacher is kind.', order_index: 6 },
            { wordbook_id: wordbook1Id, english: 'student', korean: '학생', example_sentence: 'I am a student.', order_index: 7 },
            { wordbook_id: wordbook1Id, english: 'friend', korean: '친구', example_sentence: 'He is my friend.', order_index: 8 },
            { wordbook_id: wordbook1Id, english: 'family', korean: '가족', example_sentence: 'I love my family.', order_index: 9 }
        ];

        const wordsToInsert = words.map(w => ({
            id: uuidv4(),
            ...w
        }));

        const { error: wordsError } = await supabase
            .from('words')
            .insert(wordsToInsert);

        if (wordsError && wordsError.code !== '23505') {
            console.error('Words creation error:', wordsError);
        } else {
            console.log('✅ Sample words created');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('Super Admin: stp282 / rudwlschl83');
        console.log('Academy Admin: admin / password123');
        console.log('Student: student / password123');
        console.log('Student: test1 / password123');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

// Run seeding
seedDatabase()
    .then(() => {
        console.log('\n✅ Seeding script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seeding script failed:', error);
        process.exit(1);
    });
