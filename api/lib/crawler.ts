// 중소벤처기업부 공지사항 크롤러
import * as cheerio from 'cheerio';
import type { Policy } from './supabase';

const MSS_BASE_URL = 'https://www.mss.go.kr';
const MSS_LIST_URL = `${MSS_BASE_URL}/site/smba/ex/bbs/List.do?cbIdx=248`;

export async function crawlMSS(): Promise<Policy[]> {
    try {
        const response = await fetch(MSS_LIST_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        const policies: Policy[] = [];

        // 공지사항 목록 파싱
        $('ul.board_list li, div.board_list li, table.board_list tr').each((_, element) => {
            const $el = $(element);

            // 제목 추출
            const titleEl = $el.find('a').first();
            const title = titleEl.text().trim();

            if (!title || title.length < 5) return; // 빈 항목 스킵

            // URL 추출
            const href = titleEl.attr('href') || '';
            const url = href.startsWith('http') ? href : `${MSS_BASE_URL}${href}`;

            // 분류 추출
            const category = $el.find('.category, .cate, [class*="분류"]').text().trim() ||
                $el.find('td').eq(0).text().trim();

            // 날짜 추출
            const dateText = $el.find('.date, .날짜, [class*="등록일"]').text().trim() ||
                $el.find('td').last().text().trim();
            const dateMatch = dateText.match(/\d{4}[.-]\d{2}[.-]\d{2}/);
            const published_at = dateMatch ? dateMatch[0].replace(/\./g, '-') : undefined;

            policies.push({
                title,
                source: 'mss',
                category: category || undefined,
                url,
                published_at,
                summary: `중소벤처기업부 ${category || '공지사항'}`
            });
        });

        console.log(`[MSS] Crawled ${policies.length} policies`);
        return policies;
    } catch (error) {
        console.error('[MSS] Crawl error:', error);
        return [];
    }
}

// 소상공인경제신문 크롤러
const SHOPNEWS_URL = 'https://shopnews.kr/pages/news';

export async function crawlShopNews(): Promise<Policy[]> {
    try {
        const response = await fetch(SHOPNEWS_URL);
        const html = await response.text();
        const $ = cheerio.load(html);

        const policies: Policy[] = [];

        // 뉴스 목록 파싱
        $('a[href*="/boards/"]').each((_, element) => {
            const $el = $(element);
            const title = $el.text().trim();

            if (!title || title.length < 10) return; // 너무 짧은 항목 스킵

            const href = $el.attr('href') || '';
            const url = href.startsWith('http') ? href : `https://shopnews.kr${href}`;

            // 날짜 추출 (형제 요소에서)
            const dateText = $el.parent().find('.date, time').text().trim();
            const dateMatch = dateText.match(/\d{4}[.-]\d{2}[.-]\d{2}/);
            const published_at = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

            policies.push({
                title,
                source: 'shopnews',
                category: '언론보도',
                url,
                published_at,
                summary: '소상공인경제신문'
            });
        });

        // 중복 제거
        const uniquePolicies = policies.filter((policy, index, self) =>
            index === self.findIndex((p) => p.url === policy.url)
        );

        console.log(`[ShopNews] Crawled ${uniquePolicies.length} policies`);
        return uniquePolicies;
    } catch (error) {
        console.error('[ShopNews] Crawl error:', error);
        return [];
    }
}

// 모든 소스에서 크롤링
export async function crawlAll(): Promise<Policy[]> {
    const [mssResults, shopNewsResults] = await Promise.all([
        crawlMSS(),
        crawlShopNews()
    ]);

    return [...mssResults, ...shopNewsResults];
}
