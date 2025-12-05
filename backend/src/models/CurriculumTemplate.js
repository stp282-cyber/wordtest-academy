const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CurriculumTemplate {
    static async create(data) {
        const supabase = database.getClient();
        const id = uuidv4();

        // Create template
        const { data: template, error: templateError } = await supabase
            .from('curriculum_templates')
            .insert([{
                id: id,
                academy_id: data.academy_id,
                name: data.name,
                description: data.description || ''
            }])
            .select()
            .single();

        if (templateError) throw templateError;

        // Insert items if provided
        if (data.items && data.items.length > 0) {
            const items = data.items.map((item, index) => ({
                id: uuidv4(),
                template_id: id,
                wordbook_id: item.wordbook_id,
                order_index: item.order || index,
                settings: item.settings || {}
            }));

            const { error: itemsError } = await supabase
                .from('curriculum_items')
                .insert(items);

            if (itemsError) {
                // Rollback template creation
                await supabase.from('curriculum_templates').delete().eq('id', id);
                throw itemsError;
            }
        }

        return template;
    }

    static async findByAcademy(academyId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('curriculum_templates')
            .select('*')
            .eq('academy_id', academyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async findById(id) {
        const supabase = database.getClient();

        // Get template
        const { data: template, error: templateError } = await supabase
            .from('curriculum_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (templateError) {
            if (templateError.code === 'PGRST116') return null; // Not found
            throw templateError;
        }

        // Get items
        const { data: items, error: itemsError } = await supabase
            .from('curriculum_items')
            .select('*')
            .eq('template_id', id)
            .order('order_index', { ascending: true });

        if (itemsError) throw itemsError;

        template.items = items;
        return template;
    }

    static async assignToStudent(studentId, templateId) {
        const supabase = database.getClient();
        const id = uuidv4();

        const { data, error } = await supabase
            .from('student_curriculum')
            .insert([{
                id: id,
                student_id: studentId,
                template_id: templateId,
                current_item_index: 0,
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = CurriculumTemplate;
