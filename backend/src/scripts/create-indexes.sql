-- Users Indexes
CREATE INDEX idx_users_academy ON users(academy_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Classes Indexes
CREATE INDEX idx_classes_academy ON classes(academy_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);

-- Wordbooks & Words Indexes
CREATE INDEX idx_wordbooks_academy ON wordbooks(academy_id);
CREATE INDEX idx_wordbooks_shared ON wordbooks(is_shared);
CREATE INDEX idx_words_wordbook ON words(wordbook_id);
CREATE INDEX idx_words_english ON words(english);

-- Test Results Indexes
CREATE INDEX idx_test_student ON test_results(student_id);
CREATE INDEX idx_test_academy ON test_results(academy_id);
CREATE INDEX idx_test_date ON test_results(taken_at);

-- Communication Indexes
CREATE INDEX idx_ann_academy ON announcements(academy_id);
CREATE INDEX idx_msg_sender ON messages(sender_id);
CREATE INDEX idx_msg_receiver ON messages(receiver_id);
CREATE INDEX idx_msg_academy ON messages(academy_id);

-- Curriculum Indexes
CREATE INDEX idx_sc_student ON student_curriculum(student_id);
CREATE INDEX idx_sc_template ON student_curriculum(template_id);
