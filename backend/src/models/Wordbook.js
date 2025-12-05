const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Wordbook {
    static async create(data) {
        const supabase = database.getClient();
        const id = uuidv4();

        const { data: wordbook, error } = await supabase
            .from('wordbooks')
            .insert([{
                id: id,
                academy_id: data.academy_id || null,
                name: data.name,
                description: data.description || '',
                is_shared: data.is_shared || false,
                created_by: data.created_by
            }])
            .select()
            .single();

        if (error) throw error;
        return wordbook;
    }

    static async findShared() {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('wordbooks')
            .select('*')
            .eq('is_shared', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async findByAcademy(academyId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('wordbooks')
            .select('*')
            .eq('academy_id', academyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async findById(id) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('wordbooks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data;
    }

    static async update(id, updateData) {
        const supabase = database.getClient();

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (updateData.name) updates.name = updateData.name;
        if (updateData.description !== undefined) updates.description = updateData.description;

        const { data, error } = await supabase
            .from('wordbooks')
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
            .from('wordbooks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = Wordbook;
