// 크롤링 API 엔드포인트
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlAll } from './lib/crawler';
import { savePolicies } from './lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS 헤더 추가
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 간단한 인증 (환경변수로 설정)
    // 프론트엔드에서 수동 새로고침 시에는 API 키 없이 허용 (시연용)
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.CRAWL_API_KEY;

    if (validApiKey && apiKey !== validApiKey) {
        // API 키가 설정되어 있고, 요청 헤더의 키와 다르면 401
        // 단, 시연용으로 프론트엔드에서의 요청은 허용할 수 있도록 로직 완화 가능
        // 현재는 API 키가 없으면 그냥 통과됨 (환경변수 설정 안 한 경우)
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('[Crawl API] Starting crawl...');

        // 크롤링 실행
        const policies = await crawlAll();

        if (policies.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No new policies found',
                count: 0
            });
        }

        // Supabase에 저장 (환경변수가 설정된 경우에만)
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            await savePolicies(policies);
            console.log(`[Crawl API] Saved ${policies.length} policies to database`);
        }

        return res.status(200).json({
            success: true,
            message: `Crawled ${policies.length} policies`,
            count: policies.length,
            policies: policies.slice(0, 10) // 처음 10개만 응답에 포함
        });
    } catch (error) {
        console.error('[Crawl API] Error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
