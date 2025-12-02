const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Class {
    static async create(data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO classes (id, academy_id, name, description, teacher_id)
        VALUES (:id, :academy_id, :name, :description, :teacher_id)
      `;

            await connection.execute(sql, {
                id: id,
                academy_id: data.academy_id,
                name: data.name,
                description: data.description || '',
                teacher_id: data.teacher_id || null
            });

            await connection.commit();
            return { id, ...data };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByAcademy(academyId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM classes WHERE academy_id = :academyId ORDER BY name ASC`,
                { academyId }
            );
            return result.rows;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findById(id) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM classes WHERE id = :id`,
                [id]
            );
            return result.rows[0];
        } finally {
            if (connection) await connection.close();
        }
    }

    static async addStudent(classId, studentId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const sql = `
        INSERT INTO class_students (class_id, student_id)
        VALUES (:classId, :studentId)
      `;
            await connection.execute(sql, { classId, studentId });
            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            if (err.code === 'ORA-00001') return false; // Already exists
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async getStudents(classId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const sql = `
        SELECT u.* 
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        WHERE cs.class_id = :classId
      `;
            const result = await connection.execute(sql, { classId });
            return result.rows;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async update(id, data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            let sql = 'UPDATE classes SET updated_at = CURRENT_TIMESTAMP';
            const binds = { id };

            if (data.name) { sql += ', name = :name'; binds.name = data.name; }
            if (data.description !== undefined) { sql += ', description = :description'; binds.description = data.description; }
            if (data.teacher_id !== undefined) { sql += ', teacher_id = :teacher_id'; binds.teacher_id = data.teacher_id; }

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
            await connection.execute(`DELETE FROM classes WHERE id = :id`, [id]);
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

module.exports = Class;
