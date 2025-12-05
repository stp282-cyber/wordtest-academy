const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class User {
    static async create(userData) {
        const supabase = database.getClient();
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(userData.password, 10);

        const { data, error } = await supabase
            .from('users')
            .insert([{
                id: id,
                academy_id: userData.academy_id || null,
                username: userData.username,
                password: passwordHash,
                name: userData.full_name || userData.username,
                role: userData.role,
                parent_phone: userData.phone || null,
                email: userData.email || `${userData.username}@student.local`,
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;

        const { password, ...userWithoutPassword } = data;
        return userWithoutPassword;
    }

    static async findByUsername(username, academyId) {
        const supabase = database.getClient();

        let query = supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${username}`);

        if (academyId) {
            query = query.eq('academy_id', academyId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        if (!data) return null;

        // Map to expected format
        return {
            id: data.id,
            academy_id: data.academy_id,
            username: data.username,
            email: data.email,
            password: data.password,
            password_hash: data.password,
            name: data.name,
            full_name: data.name,
            role: data.role,
            class_id: data.class_id,
            student_number: data.student_number,
            parent_phone: data.parent_phone,
            status: data.status,
            last_login: data.last_login,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
    }

    static async findByUsernameGlobal(username) {
        return this.findByUsername(username, null);
    }

    static async findAll() {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(row => ({
            id: row.id,
            academy_id: row.academy_id,
            username: row.username,
            email: row.email,
            full_name: row.name,
            role: row.role,
            status: row.status,
            created_at: row.created_at,
            last_login: row.last_login
        }));
    }

    static async findById(id) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return {
            id: data.id,
            academy_id: data.academy_id,
            username: data.username,
            email: data.email,
            password: data.password,
            name: data.name,
            full_name: data.name,
            role: data.role,
            class_id: data.class_id,
            student_number: data.student_number,
            parent_phone: data.parent_phone,
            status: data.status,
            last_login: data.last_login,
            created_at: data.created_at,
            updated_at: data.updated_at
        };
    }

    static async findByAcademy(academyId, role) {
        const supabase = database.getClient();

        let query = supabase
            .from('users')
            .select('id, academy_id, username, name, role, parent_phone, email, created_at, last_login')
            .eq('academy_id', academyId);

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) throw error;

        return data.map(row => ({
            id: row.id,
            academy_id: row.academy_id,
            username: row.username,
            full_name: row.name,
            role: row.role,
            phone: row.parent_phone,
            email: row.email,
            created_at: row.created_at,
            last_login: row.last_login
        }));
    }

    static async update(id, updateData) {
        const supabase = database.getClient();

        const updates = {
            updated_at: new Date().toISOString()
        };

        if (updateData.full_name) updates.name = updateData.full_name;
        if (updateData.phone !== undefined) updates.parent_phone = updateData.phone;
        if (updateData.email !== undefined) updates.email = updateData.email;
        if (updateData.password) {
            updates.password = await bcrypt.hash(updateData.password, 10);
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return this.findById(id);
    }

    static async delete(id) {
        const supabase = database.getClient();

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = User;
