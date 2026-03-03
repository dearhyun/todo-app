import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = "edge";

/**
 * 사용자의 할 일 데이터를 정밀 분석하여 프리미엄 비즈니스 인사이트를 제공하는 API입니다.
 */
export async function POST(req: Request) {
    try {
        const { period, todos } = await req.json();

        if (!todos || !Array.isArray(todos)) {
            return new Response(JSON.stringify({ error: "데이터 형식이 올바르지 않습니다." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const now = new Date();
        const currentDate = now.toLocaleDateString("ko-KR", {
            year: "numeric", month: "2-digit", day: "2-digit"
        }).replace(/\. /g, "-").replace(".", "");

        const { object } = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: z.object({
                summary: z.string().describe("전체 진행 상황에 대한 지능형 요약 (예: '총 10개 중 7개 완료(70%)')"),
                urgentTasks: z.array(z.string()).describe("가장 시급하게 처리해야 할 핵심 과업들"),
                insights: z.array(z.string()).describe("업업 패턴 및 집중도 분석 결과 (이모지 포함)"),
                recommandation: z.array(z.string()).describe("생산성 향상을 위한 즉각적인 실행 제언"),
                remainingTasks: z.array(z.object({
                    title: z.string(),
                    priority: z.string()
                })).optional().describe("오늘 남은 과업 중 주요 항목 (오늘 요약 시)"),
                nextWeekPlans: z.array(z.string()).optional().describe("다음 주를 위한 전략적 제언 (이번 주 요약 시)"),
                trendData: z.array(z.object({
                    name: z.string(),
                    completed: z.number(),
                })).describe("기간별 성과 추이 시각화 데이터"),
            }),
            prompt: `
            당신은 세계 최고의 수석 비즈니스 애널리스트이자 생산성 코치입니다.
            사용자의 할 일 데이터를 기반으로 아주 예리하면서도 품격 있는 분석 브리핑을 생성하세요.

            1. 진행 상황: "${period}" 기간 동안의 성과를 수치 기반으로 문장 서두에 요약.
            2. 행동 패턴: 사용자가 작업을 처리하는 시간대와 우선순위 집중도를 분석.
            3. 전략적 가이드: 단순한 나열이 아닌, "사용자의 잠재력을 최대한 끌어올릴 수 있는" 관점에서 조언.
            4. 언어: 세련되고 신뢰감이 느껴지는 한국어 사용.

            [Context]
            Current Time: ${now.toLocaleString("ko-KR")}
            Target Period: ${period}
            Raw Data: ${JSON.stringify(todos)}
            `,
        });

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("AI Insight Engine Error:", error);
        return new Response(JSON.stringify({ error: "인텔리전트 엔진 연결 중 오류가 발생했습니다." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
