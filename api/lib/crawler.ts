// 크롤러 (Mock 데이터 + 추후 Playwright 확장)
import type { Policy } from './supabase';

// Playwright가 없으면 Mock 데이터 사용
// 실제 배포 시 Playwright 기반 크롤링으로 전환 필요

// Mock 정책 데이터 (실제 크롤링 전 테스트용)
const MOCK_POLICIES: Policy[] = [
    {
        title: '2026년 소상공인 손실보전금 신청 안내',
        source: 'mss',
        category: '지원금',
        summary: '코로나19 피해 소상공인 대상 손실보전금 지원',
        url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=86&bcIdx=1001',
        published_at: new Date().toISOString().split('T')[0]
    },
    {
        title: '최저임금 개정안 2026년 시행 안내',
        source: 'mss',
        category: '노무',
        summary: '2026년 최저임금 인상 및 적용 방법 안내',
        url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=86&bcIdx=1002',
        published_at: new Date().toISOString().split('T')[0]
    },
    {
        title: '소상공인 전용 저금리 대출 상품 출시',
        source: 'shopnews',
        category: '금융',
        summary: '소상공인진흥공단 연계 저금리 대출 상품',
        url: 'https://shopnews.kr/boards/500/view',
        published_at: new Date().toISOString().split('T')[0]
    },
    {
        title: '외식업 위생등급제 신청 시 세금 혜택',
        source: 'mss',
        category: '제도',
        summary: '위생등급 취득 시 세금 감면 혜택 안내',
        url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=86&bcIdx=1003',
        published_at: new Date().toISOString().split('T')[0]
    },
    {
        title: '2026년 글로벌 강소기업 프로젝트 참여기업 모집',
        source: 'mss',
        category: '수출',
        summary: '글로벌 시장 진출 지원 프로젝트 참여 모집',
        url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=248&bcIdx=1004',
        published_at: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    }
];

// 중소벤처기업부 크롤러 (현재 Mock)
export async function crawlMSS(): Promise<Policy[]> {
    console.log('[MSS] Using mock data (Playwright required for real crawling)');

    // TODO: Playwright 기반 실제 크롤링 구현
    // 현재는 Mock 데이터 반환
    return MOCK_POLICIES.filter(p => p.source === 'mss');
}

// 소상공인경제신문 크롤러 (현재 Mock)
export async function crawlShopNews(): Promise<Policy[]> {
    console.log('[ShopNews] Using mock data (Playwright required for real crawling)');

    // TODO: Playwright 기반 실제 크롤링 구현
    return MOCK_POLICIES.filter(p => p.source === 'shopnews');
}

// 모든 소스에서 크롤링
export async function crawlAll(): Promise<Policy[]> {
    const [mssResults, shopNewsResults] = await Promise.all([
        crawlMSS(),
        crawlShopNews()
    ]);

    const allPolicies = [...mssResults, ...shopNewsResults];
    console.log(`[Crawler] Total: ${allPolicies.length} policies`);

    return allPolicies;
}
