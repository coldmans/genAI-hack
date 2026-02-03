// 정책 조회 API 엔드포인트
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPolicies } from './lib/supabase';
import { filterPoliciesForUser } from './lib/ai-filter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 쿼리 파라미터
        const limit = parseInt(req.query.limit as string) || 20;
        const source = req.query.source as string;
        const filtered = req.query.filtered === 'true'; // AI 필터링 적용 여부
        const userId = req.query.userId as string;

        // Supabase에서 정책 조회
        let policies = await getPolicies(limit);

        // 소스 필터링
        if (source && policies) {
            policies = policies.filter(p => p.source === source);
        }

        // AI 기반 맞춤 필터링
        if (filtered && policies && policies.length > 0) {
            policies = filterPoliciesForUser(policies, undefined, 5);
        }

        return res.status(200).json({
            success: true,
            count: policies?.length || 0,
            filtered,
            policies: policies || []
        });
    } catch (error) {
        console.error('[Policies API] Error:', error);

        // DB 연결 실패 시 빈 배열 반환 (개발용)
        return res.status(200).json({
            success: true,
            count: 0,
            policies: [],
            message: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.'
        });
    }
}
