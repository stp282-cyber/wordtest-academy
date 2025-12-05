const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Academy {
    static async create(academyData) {
        const supabase = database.getClient();
        const id = uuidv4();

        // Create academy
        const { data: academy, error: academyError } = await supabase
            .from('academies')
            .insert([{
                id: id,
                name: academyData.name,
                subdomain: academyData.subdomain,
                owner_id: academyData.owner_id || null,
                status: 'active'
            }])
            .select()
            .single();

        if (academyError) throw academyError;

        // Create default settings
        const { error: settingsError } = await supabase
            .from('academy_settings')
            .insert([{
                academy_id: id,
                max_students: 50
            }]);

        if (settingsError) {
            // Rollback academy creation if settings fail
            await supabase.from('academies').delete().eq('id', id);
            throw settingsError;
        }

        return academy;
    }

    static async findAll() {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('academies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async findById(id) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('academies')
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
        if (updateData.status) updates.status = updateData.status;
        if (updateData.owner_id) updates.owner_id = updateData.owner_id;

        const { data, error } = await supabase
            .from('academies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = Academy;
