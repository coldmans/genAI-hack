import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Policy } from './supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface AnalyzedPolicy extends Policy {
    isRelevant: boolean; // 소상공인 관련성 여부
    targetIndustries?: string[]; // 관련 업종
    targetLocations?: string[]; // 관련 지역
}

export async function analyzePolicyWithGemini(
    title: string,
    rawSummary: string
): Promise<Partial<AnalyzedPolicy>> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping AI analysis.');
        return { isRelevant: true }; // API 키 없으면 기본 통과
    }

    try {
        const prompt = `
    다음 뉴스/공지사항이 "소상공인, 자영업자"에게 실질적으로 도움이 되는 정책이나 정보인지 분석해줘.
    
    제목: ${title}
    내용요약: ${rawSummary}

    다음 JSON 형식으로만 응답해줘. 마크다운 없이 JSON만.
    {
      "isRelevant": boolean, // 광고, 단순 사건사고, 주식 등은 false. 실질적 혜택, 제도 변경, 지원 사업은 true
      "category": string, // "지원금", "대출", "세금", "노무", "위생", "마케팅", "기타" 중 하나
      "summary": string, // 핵심 내용 1줄 요약 (친절한 톤으로)
      "targetIndustries": string[], // 특정 업종에 한정된다면 해당 업종명 리스트 (예: ["음식점", "카페"]). 전체 대상이면 빈 배열.
      "targetLocations": string[] // 특정 지역에 한정된다면 해당 지역명 리스트 (예: ["서울", "부산"]). 전국 대상이면 빈 배열.
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // JSON 파싱 (마크다운 코드블럭 제거)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        console.log(`[Gemini] Analyzed "${title}":`, data);

        return {
            isRelevant: data.isRelevant,
            category: data.category,
            summary: data.summary,
            targetIndustries: data.targetIndustries,
            targetLocations: data.targetLocations
        };
    } catch (error) {
        console.error('[Gemini] Analysis failed:', error);
        return { isRelevant: true }; // 에러 시 일단 통과
    }
}
