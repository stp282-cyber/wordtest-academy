// const database = require('../config/database');
const database = require('../config/mockDatabase');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(userData.password, 10);

        try {
            const sql = `
        INSERT INTO users (id, academy_id, username, password, name, role, phone, email, status)
        VALUES (:id, :academy_id, :username, :password, :name, :role, :phone, :email, :status)
      `;

            await connection.execute(sql, {
                id: id,
                academy_id: userData.academy_id || null,
                username: userData.username,
                password: passwordHash,
                name: userData.full_name,
                role: userData.role,
                phone: userData.phone || null,
                email: userData.email || null,
                status: userData.status || 'active'
            });

            await connection.commit();
            const { password, ...userWithoutPassword } = userData;
            return { id, ...userWithoutPassword };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByUsername(username, academyId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            // Check both username and email
            let sql = `SELECT * FROM users WHERE (username = :username OR email = :username)`;
            const binds = { username };

            if (academyId) {
                sql += ` AND academy_id = :academyId`;
                binds.academyId = academyId;
            }

            const result = await connection.execute(sql, binds);

            // Map Oracle columns to expected format
            if (result.rows && result.rows.length > 0) {
                const row = result.rows[0];
                console.log('Debug: Raw user row:', row); // Debug log

                const user = {
                    id: row.ID || row.id,
                    academy_id: row.ACADEMY_ID || row.academy_id,
                    username: row.USERNAME || row.username,
                    email: row.EMAIL || row.email,
                    password: row.PASSWORD || row.password_hash || row.password, // Handle various password fields
                    password_hash: row.PASSWORD || row.password_hash,
                    name: row.NAME || row.full_name || row.name,
                    full_name: row.NAME || row.full_name || row.name,
                    role: row.ROLE || row.role,
                    class_id: row.CLASS_ID || row.class_id,
                    student_number: row.STUDENT_NUMBER || row.student_number,
                    parent_phone: row.PARENT_PHONE || row.parent_phone,
                    status: row.STATUS || row.status,
                    last_login: row.LAST_LOGIN || row.last_login,
                    created_at: row.CREATED_AT || row.created_at,
                    updated_at: row.UPDATED_AT || row.updated_at
                };
                return user;
            }
            return null;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByUsernameGlobal(username) {
        return this.findByUsername(username, null);
    }

    static async findAll() {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM users ORDER BY created_at DESC`
            );
            return result.rows.map(row => ({
                id: row.ID || row.id,
                academy_id: row.ACADEMY_ID || row.academy_id,
                username: row.USERNAME || row.username,
                email: row.EMAIL || row.email,
                full_name: row.NAME || row.full_name || row.name,
                role: row.ROLE || row.role,
                status: row.STATUS || row.status,
                created_at: row.CREATED_AT || row.created_at,
                last_login: row.LAST_LOGIN || row.last_login
            }));
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findById(id) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM users WHERE id = :id`,
                [id]
            );

            if (result.rows && result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    id: row.ID,
                    academy_id: row.ACADEMY_ID,
                    username: row.USERNAME,
                    email: row.EMAIL,
                    password: row.PASSWORD,
                    name: row.NAME,
                    full_name: row.NAME,
                    role: row.ROLE,
                    class_id: row.CLASS_ID,
                    student_number: row.STUDENT_NUMBER,
                    parent_phone: row.PARENT_PHONE,
                    status: row.STATUS,
                    last_login: row.LAST_LOGIN,
                    created_at: row.CREATED_AT,
                    updated_at: row.UPDATED_AT
                };
            }
            return null;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByAcademy(academyId, role) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            let sql = `SELECT id, academy_id, username, name, role, phone, email, status, created_at, last_login FROM users WHERE academy_id = :academyId`;
            const binds = { academyId };

            if (role) {
                sql += ` AND role = :role`;
                binds.role = role;
            }

            sql += ` ORDER BY name ASC`;

            const result = await connection.execute(sql, binds);

            // Map results
            return result.rows.map(row => ({
                id: row.ID,
                academy_id: row.ACADEMY_ID,
                username: row.USERNAME,
                full_name: row.NAME,
                role: row.ROLE,
                phone: row.PARENT_PHONE, // Note: using PARENT_PHONE as phone for now based on schema
                email: row.EMAIL,
                created_at: row.CREATED_AT,
                last_login: row.LAST_LOGIN
            }));
        } finally {
            if (connection) await connection.close();
        }
    }

    static async update(id, data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            let sql = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
            const binds = { id };

            if (data.full_name) { sql += ', name = :name'; binds.name = data.full_name; }
            if (data.phone !== undefined) { sql += ', parent_phone = :phone'; binds.phone = data.phone; }
            if (data.email !== undefined) { sql += ', email = :email'; binds.email = data.email; }
            if (data.status) { sql += ', status = :status'; binds.status = data.status; }
            if (data.password) {
                const passwordHash = await bcrypt.hash(data.password, 10);
                sql += ', password = :password';
                binds.password = passwordHash;
            }

            sql += ' WHERE id = :id';

            await connection.execute(sql, binds);
            await connection.commit();
            return this.findById(id);
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async delete(id) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            await connection.execute(`DELETE FROM users WHERE id = :id`, [id]);
            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = User;
