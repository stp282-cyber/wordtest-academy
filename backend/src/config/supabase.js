const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 생성
// SUPABASE_KEY는 anon public key를 사용합니다
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// 데이터베이스 초기화 (Supabase는 자동으로 연결 관리)
async function initialize() {
    try {
        console.log('🔗 Connecting to Supabase...');
        console.log('URL:', process.env.SUPABASE_URL);
        console.log('Key length:', process.env.SUPABASE_KEY?.length);

        // 연결 테스트
        const { data, error } = await supabase
            .from('academies')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase query error:', error);
            if (error.code === 'PGRST116') {
                console.log('⚠️  테이블이 비어있습니다 (정상)');
            } else {
                console.log('⚠️  연결은 되었지만 쿼리 에러:', error.message);
            }
        } else {
            console.log('✅ Supabase 데이터베이스 연결 성공');
        }
    } catch (err) {
        console.error('❌ Supabase 연결 실패:', err.message);
        console.error('Full error:', err);
    }
}

// 연결 종료 (Supabase는 자동 관리하므로 빈 함수)
async function close() {
    console.log('Supabase 연결 종료');
}

// Supabase 클라이언트 반환
function getClient() {
    return supabase;
}

module.exports = {
    initialize,
    close,
    getClient,
    supabase
};
