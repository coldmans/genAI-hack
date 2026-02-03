// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 정책 데이터 타입
export interface Policy {
    id?: string;
    title: string;
    source: 'shopnews' | 'mss' | 'naver';
    category?: string;
    summary?: string;
    url: string;
    published_at?: string;
    created_at?: string;
}

// 정책 저장 함수
export async function savePolicies(policies: Policy[]) {
    const { data, error } = await supabase
        .from('policies')
        .upsert(policies, { onConflict: 'url' });

    if (error) {
        console.error('Error saving policies:', error);
        throw error;
    }

    return data;
}

// 정책 조회 함수
export async function getPolicies(limit = 20) {
    const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching policies:', error);
        throw error;
    }

    return data;
}
