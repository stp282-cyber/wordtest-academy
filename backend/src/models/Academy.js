// const database = require('../config/database');
const database = require('../config/mockDatabase');
const { v4: uuidv4 } = require('uuid');

class Academy {
    static async create(academyData) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO academies (id, name, subdomain, owner_id, status)
        VALUES (:id, :name, :subdomain, :owner_id, :status)
      `;

            await connection.execute(sql, {
                id: id,
                name: academyData.name,
                subdomain: academyData.subdomain,
                owner_id: academyData.owner_id || null,
                status: 'active'
            });

            // Create default settings
            const settingsSql = `
        INSERT INTO academy_settings (academy_id, max_students)
        VALUES (:academy_id, :max_students)
      `;
            await connection.execute(settingsSql, {
                academy_id: id,
                max_students: 50
            });

            await connection.commit();
            return { id, ...academyData };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    static async findAll() {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const result = await connection.execute(
                `SELECT * FROM academies ORDER BY created_at DESC`
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
                `SELECT * FROM academies WHERE id = :id`,
                [id]
            );
            return result.rows[0];
        } finally {
            if (connection) await connection.close();
        }
    }

    static async update(id, updateData) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            // Dynamic query construction would be better, but keeping it simple for now
            let sql = 'UPDATE academies SET updated_at = CURRENT_TIMESTAMP';
            const binds = { id };

            if (updateData.name) {
                sql += ', name = :name';
                binds.name = updateData.name;
            }
            if (updateData.status) {
                sql += ', status = :status';
                binds.status = updateData.status;
            }
            if (updateData.owner_id) {
                sql += ', owner_id = :owner_id';
                binds.owner_id = updateData.owner_id;
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
}

module.exports = Academy;
