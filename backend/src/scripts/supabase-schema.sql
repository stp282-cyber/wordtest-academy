-- WordTest Academy - Supabase PostgreSQL Schema
-- 이 스키마는 Oracle에서 PostgreSQL로 변환되었습니다

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 학원 관리 (Academies)
CREATE TABLE academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(50) UNIQUE NOT NULL,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE academy_settings (
    academy_id UUID PRIMARY KEY REFERENCES academies(id) ON DELETE CASCADE,
    logo_url VARCHAR(255),
    theme_color VARCHAR(20),
    max_students INTEGER DEFAULT 50
);

CREATE TABLE academy_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    active_users INTEGER DEFAULT 0,
    usage_days INTEGER DEFAULT 0,
    amount DECIMAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 사용자 관리 (Users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    CONSTRAINT uq_users_username_academy UNIQUE (username, academy_id)
);

-- 3. 반 관리 (Classes)
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_students (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (class_id, student_id)
);

-- 4. 단어장 관리 (Wordbooks)
CREATE TABLE wordbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_shared BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
    english VARCHAR(255) NOT NULL,
    korean VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(50),
    example_sentence VARCHAR(500),
    difficulty_level INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0
);

-- 5. 커리큘럼 관리 (Curriculum)
CREATE TABLE curriculum_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE curriculum_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES curriculum_templates(id) ON DELETE CASCADE,
    wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    settings JSONB
);

CREATE TABLE student_curriculum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES curriculum_templates(id) ON DELETE CASCADE,
    current_item_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    completed_date TIMESTAMPTZ
);

-- 6. 학습 기록 (Learning Records)
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    wordbook_id UUID,
    test_type VARCHAR(20) NOT NULL,
    score DECIMAL NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    is_review BOOLEAN DEFAULT FALSE,
    details JSONB
);

CREATE TABLE study_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wordbook_id UUID,
    studied_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER DEFAULT 0
);

-- 7. 리워드 시스템 (Rewards)
CREATE TABLE dollar_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_settings (
    academy_id UUID PRIMARY KEY REFERENCES academies(id) ON DELETE CASCADE,
    daily_study_reward DECIMAL DEFAULT 1,
    curriculum_complete_reward DECIMAL DEFAULT 5,
    game_easy_reward DECIMAL DEFAULT 1,
    game_medium_reward DECIMAL DEFAULT 2,
    game_hard_reward DECIMAL DEFAULT 3
);

-- 8. 커뮤니케이션 (Communication)
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    target_type VARCHAR(20) DEFAULT 'all',
    target_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_important BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(1000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_users_academy ON users(academy_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_academy ON classes(academy_id);
CREATE INDEX idx_wordbooks_academy ON wordbooks(academy_id);
CREATE INDEX idx_words_wordbook ON words(wordbook_id);
CREATE INDEX idx_test_results_student ON test_results(student_id);
CREATE INDEX idx_test_results_academy ON test_results(academy_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academies_updated_at BEFORE UPDATE ON academies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wordbooks_updated_at BEFORE UPDATE ON wordbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_templates_updated_at BEFORE UPDATE ON curriculum_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
