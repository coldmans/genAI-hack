// 네이버 뉴스 검색 크롤러
import * as cheerio from 'cheerio';
import type { Policy } from './supabase';

// 네이버 뉴스 검색 URL (소상공인 키워드)
const NAVER_NEWS_URL = 'https://search.naver.com/search.naver?where=news&query=%EC%86%8C%EC%83%81%EA%B3%B5%EC%9D%B8';

// 네이버 뉴스 크롤러
export async function crawlNaverNews(): Promise<Policy[]> {
    try {
        const response = await fetch(NAVER_NEWS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9'
            }
        });

        const html = await response.text();
        const policies: Policy[] = [];

        // href 패턴으로 뉴스 링크 추출
        const linkRegex = /href="(https?:\/\/[^"]+)"\s+class="[^"]*"[^>]*target="_blank"[^>]*data-heatmap-target="\.tit"[^>]*>\s*<span[^>]*>([^<]+(?:<mark>[^<]+<\/mark>[^<]*)*)<\/span>/g;

        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            const url = match[1];
            // 제목에서 <mark> 태그 제거
            const title = match[2].replace(/<\/?mark>/g, '').trim();

            if (title && title.length > 5 && !url.includes('more')) {
                policies.push({
                    title,
                    source: 'naver',
                    category: '뉴스',
                    url,
                    published_at: new Date().toISOString().split('T')[0],
                    summary: '네이버 뉴스 - 소상공인 관련'
                });
            }
        }

        // 중복 제거
        const uniquePolicies = policies.filter((policy, index, self) =>
            index === self.findIndex((p) => p.url === policy.url)
        );

        console.log(`[Naver News] Crawled ${uniquePolicies.length} articles`);
        return uniquePolicies.slice(0, 20); // 최대 20개

    } catch (error) {
        console.error('[Naver News] Crawl error:', error);
        return [];
    }
}

// Cheerio 기반 파싱 (더 안정적)
export async function crawlNaverNewsCheerio(): Promise<Policy[]> {
    try {
        const response = await fetch(NAVER_NEWS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const policies: Policy[] = [];

        // 뉴스 링크 추출 (data-heatmap-target=".tit" 속성)
        $('a[data-heatmap-target=".tit"]').each((_, element) => {
            const $el = $(element);
            const url = $el.attr('href') || '';
            const title = $el.text().trim();

            if (title && title.length > 5 && url.startsWith('http')) {
                policies.push({
                    title,
                    source: 'naver',
                    category: '뉴스',
                    url,
                    published_at: new Date().toISOString().split('T')[0],
                    summary: '네이버 뉴스 - 소상공인 관련'
                });
            }
        });

        // 중복 제거
        const uniquePolicies = policies.filter((policy, index, self) =>
            index === self.findIndex((p) => p.url === policy.url)
        );

        console.log(`[Naver News Cheerio] Crawled ${uniquePolicies.length} articles`);
        return uniquePolicies.slice(0, 20);

    } catch (error) {
        console.error('[Naver News Cheerio] Crawl error:', error);
        return [];
    }
}

// 모든 소스에서 크롤링
export async function crawlAll(): Promise<Policy[]> {
    const results = await crawlNaverNewsCheerio();
    console.log(`[Crawler] Total: ${results.length} policies`);
    return results;
}
