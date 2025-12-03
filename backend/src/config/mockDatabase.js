const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { ROLES } = require('./constants');

// Mock Data Store
const store = {
    users: [
        {
            id: 'user-super-admin',
            username: 'stp282',
            email: 'stp282@admin.com',
            password_hash: '$2b$10$5yQhTzZiWpM02i9XPXX5KuisjzRbftCBqBoF.UemloUW6LqerpRR.',
            full_name: 'Super Admin',
            role: 'SUPER_ADMIN',
            academy_id: null
        },
        {
            id: 'user-student-1',
            username: 'student1',
            email: 'student@test.com',
            password_hash: '$2b$10$YourHashHere',
            full_name: 'John Doe',
            role: 'STUDENT',
            academy_id: 'academy-1'
        },
        {
            id: 'user-admin-1',
            username: 'admin',
            email: 'admin@academy.com',
            password_hash: '$2b$10$YourHashHere',
            full_name: 'Academy Admin',
            role: 'ACADEMY_ADMIN',
            academy_id: 'academy-1'
        }
    ],
    academies: [
        {
            id: 'academy-1',
            name: 'Test Academy',
            plan: 'premium'
        }
    ],
    classes: [
        { id: 'class-1', academy_id: 'academy-1', name: 'Class A' },
        { id: 'class-2', academy_id: 'academy-1', name: 'Class B' }
    ],
    wordbooks: [
        { id: 'wb-1', academy_id: 'academy-1', title: 'Basic Vocab', word_count: 10 },
        { id: 'wb-2', academy_id: 'academy-1', title: 'Advanced Vocab', word_count: 15 }
    ],
    words: [
        { id: 'word-1', wordbook_id: 'wb-1', english: 'hello', korean: '안녕하세요', example: 'Hello, how are you?' },
        { id: 'word-2', wordbook_id: 'wb-1', english: 'world', korean: '세계', example: 'The world is beautiful.' },
        { id: 'word-3', wordbook_id: 'wb-1', english: 'computer', korean: '컴퓨터', example: 'I use a computer every day.' },
        { id: 'word-4', wordbook_id: 'wb-1', english: 'study', korean: '공부하다', example: 'I study English.' },
        { id: 'word-5', wordbook_id: 'wb-1', english: 'book', korean: '책', example: 'This is a good book.' },
        { id: 'word-6', wordbook_id: 'wb-1', english: 'school', korean: '학교', example: 'I go to school.' },
        { id: 'word-7', wordbook_id: 'wb-1', english: 'teacher', korean: '선생님', example: 'My teacher is kind.' },
        { id: 'word-8', wordbook_id: 'wb-1', english: 'student', korean: '학생', example: 'I am a student.' },
        { id: 'word-9', wordbook_id: 'wb-1', english: 'friend', korean: '친구', example: 'He is my friend.' },
        { id: 'word-10', wordbook_id: 'wb-1', english: 'family', korean: '가족', example: 'I love my family.' }
    ],
    test_results: [
        { id: 'tr-1', student_id: 'user-student-1', score: 85, test_type: 'word_order', taken_at: new Date('2024-11-20'), wordbook_id: 'wb-1' },
        { id: 'tr-2', student_id: 'user-student-1', score: 90, test_type: 'typing', taken_at: new Date('2024-11-21'), wordbook_id: 'wb-1' },
        { id: 'tr-3', student_id: 'user-student-1', score: 95, test_type: 'word_order', taken_at: new Date('2024-11-22'), wordbook_id: 'wb-1' },
        { id: 'tr-4', student_id: 'user-student-1', score: 88, test_type: 'typing', taken_at: new Date('2024-11-25'), wordbook_id: 'wb-2' },
        { id: 'tr-5', student_id: 'user-student-1', score: 92, test_type: 'word_order', taken_at: new Date('2024-11-28'), wordbook_id: 'wb-2' }
    ],
    student_curriculum: [
        { id: 'sc-1', student_id: 'user-student-1', template_id: 'template-1', status: 'active' }
    ],
    curriculum_items: [
        { id: 'ci-1', template_id: 'template-1', wordbook_id: 'wb-1', order_index: 1 },
        { id: 'ci-2', template_id: 'template-1', wordbook_id: 'wb-2', order_index: 2 }
    ]
};

class MockConnection {
    async execute(sql, binds = {}) {
        console.log('[MockDB] Executing SQL:', sql.substring(0, 100) + '...', binds);

        const sqlLower = sql.toLowerCase().trim();

        // Normalize binds keys to lowercase
        const normalizedBinds = {};
        for (const key in binds) {
            normalizedBinds[key.toLowerCase()] = binds[key];
        }

        // 1. User queries
        if (sqlLower.includes('select * from users') && (sqlLower.includes('username') || sqlLower.includes('email'))) {
            const username = normalizedBinds.username || normalizedBinds.email;
            const user = store.users.find(u =>
                u.username === username ||
                u.email === username
            );
            return { rows: user ? [user] : [] };
        }

        if (sqlLower.includes('select * from users') && !sqlLower.includes('where')) {
            // Find All Users
            return { rows: store.users };
        }

        if (sqlLower.includes('select * from users') && sqlLower.includes('id = :id')) {
            const id = Array.isArray(binds) ? binds[0] : normalizedBinds.id;
            const user = store.users.find(u => u.id === id);
            return { rows: user ? [user] : [] };
        }

        if (sqlLower.includes('from users') && sqlLower.includes('academy_id = :academyid') && sqlLower.includes('role = :role')) {
            const academyId = normalizedBinds.academyid;
            const role = normalizedBinds.role;
            const users = store.users.filter(u => u.academy_id === academyId && u.role === role);

            // Map to uppercase keys as per Oracle driver behavior
            const mappedUsers = users.map(u => ({
                ID: u.id,
                ACADEMY_ID: u.academy_id,
                USERNAME: u.username,
                NAME: u.full_name,
                ROLE: u.role,
                PHONE: u.phone,
                EMAIL: u.email,
                CREATED_AT: u.created_at,
                LAST_LOGIN: u.last_login
            }));
            return { rows: mappedUsers };
        }

        // 1.5 Academy queries
        if (sqlLower.includes('select * from academies') && !sqlLower.includes('where')) {
            // Find All
            const academies = store.academies.map(a => ({
                ID: a.id,
                NAME: a.name,
                SUBDOMAIN: a.subdomain,
                OWNER_ID: a.owner_id,
                PLAN: a.plan,
                STATUS: a.status || 'active',
                CREATED_AT: a.created_at || new Date()
            }));
            return { rows: academies };
        }

        if (sqlLower.includes('select * from academies') && sqlLower.includes('id = :id')) {
            // Find By ID
            const id = Array.isArray(binds) ? binds[0] : normalizedBinds.id;
            const academy = store.academies.find(a => a.id === id);
            if (academy) {
                return {
                    rows: [{
                        ID: academy.id,
                        NAME: academy.name,
                        SUBDOMAIN: academy.subdomain,
                        OWNER_ID: academy.owner_id,
                        PLAN: academy.plan,
                        STATUS: academy.status || 'active',
                        CREATED_AT: academy.created_at || new Date()
                    }]
                };
            }
            return { rows: [] };
        }

        // 2. Analytics queries
        if (sqlLower.includes('from test_results') && sqlLower.includes('student_id')) {
            const studentId = normalizedBinds.studentid;
            console.log('[MockDB] Fetching test results for student:', studentId);

            if (!studentId) {
                console.error('[MockDB] Error: studentId is missing in binds', binds);
                return { rows: [] };
            }

            const results = store.test_results.filter(r => r.student_id === studentId);
            // Convert to uppercase keys for Oracle compatibility
            const formattedResults = results.map(r => ({
                TAKEN_AT: r.taken_at,
                SCORE: r.score,
                TEST_TYPE: r.test_type
            }));
            return { rows: formattedResults };
        }

        if (sqlLower.includes('select c.name as class_name, avg(tr.score)')) {
            return {
                rows: [
                    { CLASS_NAME: 'Class A', AVG_SCORE: 88 },
                    { CLASS_NAME: 'Class B', AVG_SCORE: 75 }
                ]
            };
        }

        // 3. Learning queries - Get wordbook for student
        if (sqlLower.includes('from student_curriculum') && sqlLower.includes('curriculum_items')) {
            const studentId = normalizedBinds.studentid;
            const curriculum = store.student_curriculum.find(sc => sc.student_id === studentId && sc.status === 'active');
            if (curriculum) {
                const item = store.curriculum_items.find(ci => ci.template_id === curriculum.template_id);
                if (item) {
                    return { rows: [{ WORDBOOK_ID: item.wordbook_id }] };
                }
            }
            return { rows: [] };
        }

        // 4. Fallback wordbook query
        if (sqlLower.includes('select id from wordbooks')) {
            if (store.wordbooks.length > 0) {
                return { rows: [{ ID: store.wordbooks[0].id }] };
            }
            return { rows: [] };
        }

        // 5. Words by wordbook
        if (sqlLower.includes('from words') && sqlLower.includes('wordbook_id')) {
            const wordbookId = normalizedBinds.wordbookid;
            const words = store.words.filter(w => w.wordbook_id === wordbookId);
            // Convert to uppercase keys
            const formattedWords = words.map(w => ({
                ID: w.id,
                WORDBOOK_ID: w.wordbook_id,
                ENGLISH: w.english,
                KOREAN: w.korean,
                EXAMPLE: w.example
            }));
            return { rows: formattedWords };
        }

        // 6. Wordbooks queries
        if (sqlLower.includes('from wordbooks') && sqlLower.includes('academy_id')) {
            const academyId = normalizedBinds.academyid;
            const wordbooks = store.wordbooks.filter(wb => wb.academy_id === academyId);
            const formattedWordbooks = wordbooks.map(wb => ({
                ID: wb.id,
                ACADEMY_ID: wb.academy_id,
                TITLE: wb.title,
                WORD_COUNT: wb.word_count
            }));
            return { rows: formattedWordbooks };
        }

        // 7. INSERT queries
        if (sqlLower.includes('insert into academies')) {
            const newAcademy = {
                id: normalizedBinds.id || `academy-${Date.now()}`,
                name: normalizedBinds.name,
                subdomain: normalizedBinds.subdomain,
                owner_id: normalizedBinds.owner_id,
                plan: 'free', // Default
                created_at: new Date(),
                updated_at: new Date()
            };
            store.academies.push(newAcademy);
            console.log('[MockDB] Inserted academy:', newAcademy);
            return { rows: [], rowsAffected: 1 }; // Return rowsAffected for standard DB behavior
        }

        if (sqlLower.includes('insert into users')) {
            const newUser = {
                id: normalizedBinds.id || `user-${Date.now()}`,
                academy_id: normalizedBinds.academy_id,
                username: normalizedBinds.username,
                password_hash: normalizedBinds.password, // Note: User.create passes hashed password as 'password' bind
                full_name: normalizedBinds.name,
                role: normalizedBinds.role,
                email: normalizedBinds.email,
                phone: normalizedBinds.phone,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            };
            store.users.push(newUser);
            console.log('[MockDB] Inserted user:', newUser);
            return { rows: [], rowsAffected: 1 };
        }

        if (sqlLower.includes('insert into academy_settings')) {
            console.log('[MockDB] Inserted academy settings');
            return { rows: [], rowsAffected: 1 };
        }

        if (sqlLower.includes('insert into')) {
            return { rows: [], rowsAffected: 1 };
        }

        // 8. UPDATE queries
        if (sqlLower.includes('update ')) {
            console.log('[MockDB] Update query executed');
            return { rows: [], rowsAffected: 1 };
        }

        // Default empty
        console.log('[MockDB] No handler for query, returning empty');
        return { rows: [] };
    }

    async commit() { console.log('[MockDB] Commit'); }
    async rollback() { console.log('[MockDB] Rollback'); }
    async close() { console.log('[MockDB] Connection Closed'); }
}

class MockPool {
    async getConnection() {
        return new MockConnection();
    }
}

const mockDatabase = {
    pool: new MockPool(),

    async initialize() {
        console.log('[MockDB] Initializing Mock Database...');
        // Hash passwords for mock users
        const hash = await bcrypt.hash('rudwlschl83', 10);
        store.users[0].password_hash = hash; // stp282

        const studentHash = await bcrypt.hash('password123', 10);
        store.users[1].password_hash = studentHash; // student@test.com
        store.users[2].password_hash = studentHash; // admin@academy.com

        console.log('[MockDB] Initialized with users:', store.users.map(u => u.email || u.username));
        console.log('[MockDB] Wordbooks:', store.wordbooks.length);
        console.log('[MockDB] Words:', store.words.length);
    },

    getPool() {
        return this.pool;
    },

    async close() {
        console.log('[MockDB] Closed');
    }
};

module.exports = mockDatabase;
