const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Word {
    static async create(data) {
        const supabase = database.getClient();
        const id = uuidv4();

        const { data: word, error } = await supabase
            .from('words')
            .insert([{
                id: id,
                wordbook_id: data.wordbook_id,
                english: data.english,
                korean: data.korean,
                part_of_speech: data.part_of_speech || null,
                example_sentence: data.example_sentence || null,
                difficulty_level: data.difficulty_level || 1,
                order_index: data.order_index || 0
            }])
            .select()
            .single();

        if (error) throw error;
        return word;
    }

    static async findByWordbook(wordbookId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('words')
            .select('*')
            .eq('wordbook_id', wordbookId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data;
    }

    static async update(id, updateData) {
        const supabase = database.getClient();

        const updates = {};

        if (updateData.english) updates.english = updateData.english;
        if (updateData.korean) updates.korean = updateData.korean;
        if (updateData.example_sentence !== undefined) updates.example_sentence = updateData.example_sentence;

        const { data, error } = await supabase
            .from('words')
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
            .from('words')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

module.exports = Word;
