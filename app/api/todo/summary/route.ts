import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERAITVE_AI_API_KEY,
});

export const runtime = "edge";

/**
 * 사용자의 할 일 목록을 분석하여 요약 및 인사이트를 제공하는 API입니다.
 */
export async function POST(req: Request) {
    try {
        const { period, todos } = await req.json();

        if (!todos || !Array.isArray(todos)) {
            return new Response(JSON.stringify({ error: "할 일 데이터가 유효하지 않습니다." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const now = new Date();
        const currentDate = now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, "-").replace(".", "");

        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                summary: z.string().describe("전체적인 진행 상황 요약 (한 문장)"),
                urgentTasks: z.array(z.string()).describe("가장 시급하거나 중요한 할 일 목록"),
                insights: z.array(z.string()).describe("업무 패턴 및 시간대별 집중도 분석 인사이트"),
                recommandation: z.array(z.string()).describe("생산성 향상을 위한 구체적인 실행 권고 사항"),
                trendData: z.array(z.object({
                    name: z.string(),
                    completed: z.number(),
                    total: z.number(),
                })).optional().describe("요일별 완료 추이 데이터 (이번 주 요약인 경우)"),
            }),
            prompt: `
            사용자의 할 일 데이터를 심층 분석하여 한국어로 친근하면서도 전문적인 인사이트를 제공해주세요.
            
            입력 데이터 (할 일 목록): ${JSON.stringify(todos)}
            분석 기간: ${period === "today" ? "오늘 (" + currentDate + ")" : "이번 주 전체"}
            현재 시각: ${now.toLocaleString("ko-KR")}
            
            [핵심 분석 및 요약 지침]
            
            1. 완료율 및 패턴 분석 (Completion Analysis)
               - 기간 내 전체 할 일 대비 완료된 할 일의 비율을 계산하세요.
               - 우선순위별(Urgent/High 등)로 어떤 작업이 먼저 완료되는지 패턴을 분석하세요.
               - (추정) 이전 데이터와 비교하여 생산성이 개선되었는지 언급하며 칭찬하세요.
            
            2. 시간 관리 및 집중도 (Time Management)
               - 마감일 준수 여부를 확인하고, 연기되거나 방치된 할 일의 빈도를 파악하세요.
               - 'due_time' 분포를 분석하여 사용자의 주된 업무 집중 시간대를 도출하세요.
            
            3. 생산성 인사이트 (Productivity Insights)
               - 가장 생산적인 요일이나 시간대를 식별하여 알려주세요.
               - 유독 자주 미루게 되는 작업 유형(예: 공부, 보고서 등 특정 카테고리)이 있다면 조심스럽게 언급하세요.
            
            4. 기간별 차별화된 접근 (Contextual Summary)
               - [오늘의 요약]: 당일의 높은 집중도가 필요한 작업과 남은 일정의 우선순위를 명확히 제시하세요.
               - [이번 주 요약]: 한 주간의 전반적인 업무 흐름을 복기하고, 다음 주를 위한 준비 사항을 제안하세요.
            
            5. 긍정적 피드백 및 실행 권고 (Positive Coaching)
               - 말투: "정말 대단해요!", "조금만 더 힘내볼까요?"와 같이 동기부여가 되는 긍정적이고 따뜻한 톤을 유지하세요.
               - 추천사항: "오후에 업무가 몰려있으니 1시간 일찍 시작해보는 건 어떨까요?"와 같이 구체적이고 실천 가능한 분산 전략을 제안하세요.
            
            6. 출력 형식 규칙
               - summary: "총 X개 중 Y개 완료(Z%)"를 포함한 한 문장 요약.
               - insights: 데이터 기반의 날카롭지만 따뜻한 분석 2~3개.
               - recommandation: 바로 행동으로 옮길 수 있는 팁 2~3개.
            `,
        });

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("AI 요약 분석 오류:", error);
        return new Response(JSON.stringify({ error: "분석 중 오류가 발생했습니다: " + error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
