const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CurriculumTemplate {
    static async create(data) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        const id = uuidv4();

        try {
            const sql = `
        INSERT INTO curriculum_templates (id, academy_id, name, description)
        VALUES (:id, :academy_id, :name, :description)
      `;

            await connection.execute(sql, {
                id: id,
                academy_id: data.academy_id,
                name: data.name,
                description: data.description || ''
            });

            // Insert items
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    const itemId = uuidv4();
                    const itemSql = `
                INSERT INTO curriculum_items (id, template_id, wordbook_id, order_index, settings)
                VALUES (:id, :template_id, :wordbook_id, :order_index, :settings)
            `;
                    await connection.execute(itemSql, {
                        id: itemId,
                        template_id: id,
                        wordbook_id: item.wordbook_id,
                        order_index: item.order,
                        settings: JSON.stringify(item.settings || {})
                    });
                }
            }

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
                `SELECT * FROM curriculum_templates WHERE academy_id = :academyId ORDER BY created_at DESC`,
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
                `SELECT * FROM curriculum_templates WHERE id = :id`,
                [id]
            );
            const template = result.rows[0];

            if (template) {
                // Get items
                const itemsResult = await connection.execute(
                    `SELECT * FROM curriculum_items WHERE template_id = :id ORDER BY order_index ASC`,
                    [id]
                );
                template.items = itemsResult.rows.map(item => ({
                    ...item,
                    settings: JSON.parse(item.settings || '{}')
                }));
            }

            return template;
        } finally {
            if (connection) await connection.close();
        }
    }

    static async assignToStudent(studentId, templateId) {
        const pool = database.getPool();
        const connection = await pool.getConnection();
        try {
            const id = uuidv4();
            const sql = `
            INSERT INTO student_curriculum (id, student_id, template_id, current_item_index, status)
            VALUES (:id, :studentId, :templateId, 0, 'active')
        `;
            await connection.execute(sql, { id, studentId, templateId });
            await connection.commit();
            return { id, studentId, templateId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            if (connection) await connection.close();
        }
    }
}

module.exports = CurriculumTemplate;
