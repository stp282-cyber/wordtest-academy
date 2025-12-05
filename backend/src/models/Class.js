const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Class {
    static async create(data) {
        const supabase = database.getClient();
        const id = uuidv4();

        const { data: classData, error } = await supabase
            .from('classes')
            .insert([{
                id: id,
                academy_id: data.academy_id,
                name: data.name,
                description: data.description || '',
                teacher_id: data.teacher_id || null
            }])
            .select()
            .single();

        if (error) throw error;
        return classData;
    }

    static async findByAcademy(academyId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('academy_id', academyId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async findById(id) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    }

    static async addStudent(classId, studentId) {
        const supabase = database.getClient();

        const { error } = await supabase
            .from('class_students')
            .insert([{
                class_id: classId,
                student_id: studentId
            }]);

        if (error) {
            // Check for unique constraint violation (student already in class)
            if (error.code === '23505') return false;
            throw error;
        }

        return true;
    }

    static async getStudents(classId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('class_students')
            .select(`
                student_id,
                users (*)
            `)
            .eq('class_id', classId);

        if (error) throw error;

        // Extract user data from nested structure
        return data.map(item => item.users);
    }

    static async update(id, updateData) {
        const supabase = database.getClient();

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (updateData.name) updates.name = updateData.name;
        if (updateData.description !== undefined) updates.description = updateData.description;
        if (updateData.teacher_id !== undefined) updates.teacher_id = updateData.teacher_id;

        const { data, error } = await supabase
            .from('classes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id) {
        const supabase = database.getClient();

        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = Class;
