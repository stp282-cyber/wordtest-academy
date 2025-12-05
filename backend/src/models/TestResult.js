const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TestResult {
    static async create(data) {
        const supabase = database.getClient();
        const id = uuidv4();

        const { data: result, error } = await supabase
            .from('test_results')
            .insert([{
                id: id,
                student_id: data.student_id,
                academy_id: data.academy_id,
                wordbook_id: data.wordbook_id,
                test_type: data.test_type,
                score: data.score,
                total_questions: data.total_questions,
                correct_count: data.correct_count,
                wrong_count: data.wrong_count,
                is_review: data.is_review || false,
                details: data.details || {}
            }])
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    static async findByStudent(studentId) {
        const supabase = database.getClient();

        const { data, error } = await supabase
            .from('test_results')
            .select('*')
            .eq('student_id', studentId)
            .order('taken_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}

module.exports = TestResult;
