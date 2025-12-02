const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Wordbook {
    static async create(data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO wordbooks (id, academy_id, name, description, is_shared, created_by)
        VALUES (:id, :academy_id, :name, :description, :is_shared, :created_by)
      `;

            await connection.execute(sql, {
                id: id,
                academy_id: data.academy_id || null,
                name: data.name,
                description: data.description || '',
                is_shared: data.is_shared ? 1 : 0,
                created_by: data.created_by
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

    static async findShared() {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM wordbooks WHERE is_shared = 1 ORDER BY created_at DESC`
            );
            return result.rows;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findByAcademy(academyId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM wordbooks WHERE academy_id = :academyId ORDER BY created_at DESC`,
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
                `SELECT * FROM wordbooks WHERE id = :id`,
                [id]
            );
            return result.rows[0];
        } finally {
            if (connection) await connection.close();
        }
    }

    static async update(id, data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            let sql = 'UPDATE wordbooks SET updated_at = CURRENT_TIMESTAMP';
            const binds = { id };

            if (data.name) {
                sql += ', name = :name';
                binds.name = data.name;
            }
            if (data.description !== undefined) {
                sql += ', description = :description';
                binds.description = data.description;
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
            await connection.execute(
                `DELETE FROM wordbooks WHERE id = :id`,
                [id]
            );
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

module.exports = Wordbook;
