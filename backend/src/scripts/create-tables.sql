-- 1. 학원 관리 (Academies)
CREATE TABLE academies (
    id VARCHAR2(36) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    subdomain VARCHAR2(50) UNIQUE NOT NULL,
    owner_id VARCHAR2(36), -- User ID of the academy admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR2(20) DEFAULT 'active' -- active, suspended, etc.
);

CREATE TABLE academy_settings (
    academy_id VARCHAR2(36) PRIMARY KEY,
    logo_url VARCHAR2(255),
    theme_color VARCHAR2(20),
    max_students NUMBER DEFAULT 50,
    CONSTRAINT fk_academy_settings FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

CREATE TABLE academy_usage (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36) NOT NULL,
    year_month VARCHAR2(7) NOT NULL, -- YYYY-MM
    active_users NUMBER DEFAULT 0,
    usage_days NUMBER DEFAULT 0,
    amount NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_academy_usage FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

-- 2. 사용자 관리 (Users)
CREATE TABLE users (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36), -- NULL for Super Admin
    username VARCHAR2(50) NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(50) NOT NULL,
    role VARCHAR2(20) NOT NULL, -- super_admin, academy_admin, teacher, student
    phone VARCHAR2(20),
    email VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT fk_users_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE,
    CONSTRAINT uq_users_username_academy UNIQUE (username, academy_id) -- Username unique per academy
);

-- 3. 반 관리 (Classes)
CREATE TABLE classes (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36) NOT NULL,
    name VARCHAR2(50) NOT NULL,
    description VARCHAR2(255),
    teacher_id VARCHAR2(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE,
    CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE class_students (
    class_id VARCHAR2(36) NOT NULL,
    student_id VARCHAR2(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (class_id, student_id),
    CONSTRAINT fk_cs_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 단어장 관리 (Wordbooks)
CREATE TABLE wordbooks (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36), -- NULL for Shared Wordbooks
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(255),
    is_shared NUMBER(1) DEFAULT 0, -- 0: Private, 1: Shared
    created_by VARCHAR2(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wordbooks_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

CREATE TABLE words (
    id VARCHAR2(36) PRIMARY KEY,
    wordbook_id VARCHAR2(36) NOT NULL,
    english VARCHAR2(255) NOT NULL,
    korean VARCHAR2(255) NOT NULL,
    part_of_speech VARCHAR2(50),
    example_sentence VARCHAR2(500),
    difficulty_level NUMBER DEFAULT 1,
    order_index NUMBER DEFAULT 0,
    CONSTRAINT fk_words_wordbook FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id) ON DELETE CASCADE
);

-- 5. 커리큘럼 관리 (Curriculum)
CREATE TABLE curriculum_templates (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_curriculum_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

CREATE TABLE curriculum_items (
    id VARCHAR2(36) PRIMARY KEY,
    template_id VARCHAR2(36) NOT NULL,
    wordbook_id VARCHAR2(36) NOT NULL,
    order_index NUMBER NOT NULL,
    settings CLOB, -- JSON settings for this item (words_per_test, etc.)
    CONSTRAINT fk_ci_template FOREIGN KEY (template_id) REFERENCES curriculum_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_ci_wordbook FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id) ON DELETE CASCADE
);

CREATE TABLE student_curriculum (
    id VARCHAR2(36) PRIMARY KEY,
    student_id VARCHAR2(36) NOT NULL,
    template_id VARCHAR2(36) NOT NULL,
    current_item_index NUMBER DEFAULT 0,
    status VARCHAR2(20) DEFAULT 'active', -- active, completed, paused
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP,
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_template FOREIGN KEY (template_id) REFERENCES curriculum_templates(id) ON DELETE CASCADE
);

-- 6. 학습 기록 (Learning Records)
CREATE TABLE test_results (
    id VARCHAR2(36) PRIMARY KEY,
    student_id VARCHAR2(36) NOT NULL,
    academy_id VARCHAR2(36) NOT NULL,
    wordbook_id VARCHAR2(36),
    test_type VARCHAR2(20) NOT NULL, -- typing, word_order, etc.
    score NUMBER NOT NULL,
    total_questions NUMBER NOT NULL,
    correct_count NUMBER NOT NULL,
    wrong_count NUMBER NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_review NUMBER(1) DEFAULT 0, -- 0: Regular, 1: Review
    details CLOB, -- JSON details of the test
    CONSTRAINT fk_tr_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

CREATE TABLE study_logs (
    id VARCHAR2(36) PRIMARY KEY,
    student_id VARCHAR2(36) NOT NULL,
    wordbook_id VARCHAR2(36),
    studied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds NUMBER DEFAULT 0,
    CONSTRAINT fk_sl_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. 리워드 시스템 (Rewards)
CREATE TABLE dollar_history (
    id VARCHAR2(36) PRIMARY KEY,
    student_id VARCHAR2(36) NOT NULL,
    amount NUMBER NOT NULL, -- Positive for earn, Negative for spend
    reason VARCHAR2(100) NOT NULL, -- 'daily_study', 'game_win', 'manual_grant'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dh_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reward_settings (
    academy_id VARCHAR2(36) PRIMARY KEY,
    daily_study_reward NUMBER DEFAULT 1,
    curriculum_complete_reward NUMBER DEFAULT 5,
    game_easy_reward NUMBER DEFAULT 1,
    game_medium_reward NUMBER DEFAULT 2,
    game_hard_reward NUMBER DEFAULT 3,
    CONSTRAINT fk_rs_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

-- 8. 커뮤니케이션 (Communication)
CREATE TABLE announcements (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36) NOT NULL,
    title VARCHAR2(200) NOT NULL,
    content CLOB NOT NULL,
    author_id VARCHAR2(36) NOT NULL,
    target_type VARCHAR2(20) DEFAULT 'all', -- all, class
    target_id VARCHAR2(36), -- class_id if target_type is class
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_important NUMBER(1) DEFAULT 0,
    CONSTRAINT fk_ann_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id VARCHAR2(36) PRIMARY KEY,
    academy_id VARCHAR2(36) NOT NULL,
    sender_id VARCHAR2(36) NOT NULL,
    receiver_id VARCHAR2(36) NOT NULL,
    content VARCHAR2(1000) NOT NULL,
    is_read NUMBER(1) DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_academy FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
