// AI 기반 사용자 맞춤 정책 필터링
import type { Policy } from './supabase';

// 사용자 프로필 타입
interface UserProfile {
    businessType: string;    // 업종 (예: 음식점, 소매업, 서비스업)
    location: string;        // 지역 (예: 서울, 인천, 경기)
    interests: string[];     // 관심사 (예: ['대출', '지원금', '세금'])
    businessSize?: string;   // 사업 규모 (예: '1인', '5인 미만')
}

// 기본 사용자 프로필 (시연용)
const DEFAULT_USER_PROFILE: UserProfile = {
    businessType: '음식점',
    location: '인천',
    interests: ['지원금', '대출', '세제 혜택', '위생'],
    businessSize: '5인 미만'
};

// 키워드 매칭 기반 관련성 점수 계산
function calculateRelevanceScore(policy: Policy, profile: UserProfile): number {
    let score = 0;
    const title = policy.title.toLowerCase();
    const summary = (policy.summary || '').toLowerCase();
    const content = title + ' ' + summary;

    // 업종 매칭
    const businessKeywords: Record<string, string[]> = {
        '음식점': ['음식', '외식', '식당', '요식', '배달', '위생', '식품'],
        '소매업': ['소매', '유통', '판매', '매장', '상점'],
        '서비스업': ['서비스', '프리랜서', '용역'],
        '제조업': ['제조', '생산', '공장', '산업']
    };

    const keywords = businessKeywords[profile.businessType] || [];
    keywords.forEach(keyword => {
        if (content.includes(keyword)) score += 2;
    });

    // 주요 행정구역 목록
    const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '청주', '천안', '전주', '포항', '창원', '김해'];

    // 타 지역 배제 로직 (Negative Filtering)
    if (profile.location && profile.location !== '전국') {
        const userLoc = profile.location.substring(0, 2); // 앞 2글자만 비교 (예: 대전광역시 -> 대전)

        // 내 지역이 포함되어 있으면 가산점
        if (content.includes(userLoc)) {
            score += 5; // 가산점 상향
        } else {
            // 내 지역은 없는데 타 지역 명칭이 명시적으로 있는 경우 감점
            const otherRegion = regions.find(r => content.includes(r) && !r.startsWith(userLoc) && userLoc.indexOf(r) === -1);
            if (otherRegion) {
                // 단, '전국', '정부', '중기부' 등 전국 대상 키워드가 없으면 제외
                if (!content.includes('전국') && !content.includes('정부') && !content.includes('방방곡곡')) {
                    console.log(`[AI Filter] Excluding '${policy.title}' (Mismatch: User=${userLoc}, Found=${otherRegion})`);
                    score -= 100; // 사실상 제외
                }
            }
        }
    }

    // 관심사 매칭
    profile.interests.forEach(interest => {
        if (content.includes(interest.toLowerCase())) {
            score += 2;
        }
    });

    // 공통 높은 관심 키워드
    const highInterestKeywords = ['소상공인', '지원', '신청', '마감', '혜택', '무료'];
    highInterestKeywords.forEach(keyword => {
        if (content.includes(keyword)) score += 1;
    });

    return score;
}

// 정책 필터링 및 정렬
export function filterPoliciesForUser(
    policies: Policy[],
    profile: UserProfile = DEFAULT_USER_PROFILE,
    maxCount: number = 5
): Policy[] {
    // 관련성 점수 계산 및 정렬
    const scoredPolicies = policies.map(policy => {
        const score = calculateRelevanceScore(policy, profile);
        // console.log(`[AI Filter] Policy: "${policy.title}" Score: ${score}`);
        return { policy, score };
    });

    // 점수순 정렬
    scoredPolicies.sort((a, b) => b.score - a.score);

    // 최소 점수 이상만 필터링 (기준: 1점 이상)
    // 최근 뉴스여도 점수가 -10 이하면 (타 지역) 제외
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const relevantPolicies = scoredPolicies
        .filter(item => {
            if (item.score <= -10) return false; // 타 지역 등 명시적 제외 대상

            const isRecent = item.policy.published_at && new Date(item.policy.published_at) >= threeDaysAgo;
            return item.score >= 1 || isRecent;
        })
        .slice(0, maxCount)
        .map(item => item.policy);

    console.log(`[AI Filter] Filtered ${relevantPolicies.length}/${policies.length} policies for user (${profile.location})`);

    return relevantPolicies;
}

// 사용자 프로필 조회 (Supabase에서)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    // TODO: Supabase에서 사용자 프로필 조회
    // 현재는 기본 프로필 반환
    return DEFAULT_USER_PROFILE;
}

// 맞춤 알림 메시지 생성
export function generateAlertMessage(policy: Policy, profile: UserProfile): string {
    const categoryEmoji: Record<string, string> = {
        '지원금': '💰',
        '대출': '🏦',
        '세금': '📋',
        '노무': '👥',
        '위생': '🧹',
        '뉴스': '📰',
        '정책': '📢'
    };

    const emoji = categoryEmoji[policy.category || '정책'] || '📌';

    return `${emoji} [${profile.businessType} 사장님 맞춤] ${policy.title}`;
}
