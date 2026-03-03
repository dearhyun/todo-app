import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// 사용자 요청에 따른 환경 변수명을 사용하여 Google AI 인스턴스 생성
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERAITVE_AI_API_KEY,
});

export const runtime = "edge";

/**
 * 자연어로 입력된 할 일을 구조화된 데이터로 변환하는 API입니다.
 * 입력 검증, 전처리, AI 분석, 후처리 로직을 포함합니다.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        let { text } = body;

        // 1. 전처리 (Preprocessing)
        if (typeof text !== "string") {
            return new Response(JSON.stringify({ error: "입력 형식이 올바르지 않습니다." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        text = text.trim()                           // 앞뒤 공백 제거
            .replace(/\s+/g, " ");            // 연속된 공백을 하나로 통합

        // 2. 입력 검증 (Input Validation)
        if (!text || text.length === 0) {
            return new Response(JSON.stringify({ error: "할 일을 입력해주세요." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (text.length < 2) {
            return new Response(JSON.stringify({ error: "내용이 너무 짧습니다. 최소 2자 이상 입력해주세요." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (text.length > 500) {
            return new Response(JSON.stringify({ error: "내용이 너무 깁니다. 500자 이내로 입력해주세요." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 현재 시간 정보
        const now = new Date();
        const currentDate = now.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, "-").replace(".", "");
        const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

        // 3. AI 분석 수행
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                is_task: z.boolean().describe("입력이 실제 할 일이나 업무인지 여부"),
                tasks: z.array(z.object({
                    title: z.string(),
                    due_date: z.string(),
                    due_time: z.string(),
                    priority: z.enum(["low", "medium", "high", "urgent"]),
                    category: z.string(),
                }))
            }),
            prompt: `
            사용자의 입력 텍스트가 실제 '할 일'이나 '업무'에 해당하는지 분석하고 구조화된 JSON 데이터로 변환해주세요.
            
            입력 텍스트: "${text}"
            현재 기준 시각: ${currentDate} ${currentTime}
            
            [분석 및 판단 규칙]
            1. 타당성 검사 (is_task): 
               - 단순한 감정 표현("졸리다", "배고프다"), 의미 없는 감탄사, 인사말 등은 할 일이 아닙니다 (is_task: false).
               - 구체적인 행동, 약속, 공부, 업무 등 미래에 수행해야 할 활동은 할 일입니다 (is_task: true).
            2. 분리 원칙: is_task가 true일 때, 여러 개의 할 일이 포함되어 있다면 각각 분리하여 배열로 반환하세요.
            3. 날짜/시간/우선순위 처리: 이전 지침과 동일하게 처리합니다.
            `,
        });

        // 할 일이 아닌 경우 에러 반환
        if (!object.is_task || object.tasks.length === 0) {
            return new Response(JSON.stringify({ error: "입력하신 내용에서 명확한 할 일을 찾지 못했습니다. 구체적인 업무나 계획을 입력해 주세요." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 4. 후처리 (Post-processing)
        const parsedTasks = object.tasks.map(task => {
            let t = { ...task };

            // 4.1 날짜 보정: 생성된 날짜가 과거라면 오늘로 설정
            const targetDate = new Date(t.due_date);
            const todayReset = new Date(currentDate);
            if (targetDate < todayReset) {
                t.due_date = currentDate;
            }

            // 4.2 제목 길이 조정
            if (t.title.length > 50) {
                t.title = t.title.substring(0, 47) + "...";
            } else if (t.title.length < 1) {
                t.title = text.substring(0, 20);
            }

            // 4.3 필수 필드 기본값 보장
            t.due_time = t.due_time || "09:00";
            t.priority = t.priority || "medium";
            t.category = t.category || "기타";

            return t;
        });

        return new Response(JSON.stringify(parsedTasks), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("AI 할 일 변환 오류:", error);

        // 호출 한도 초과 처리 (Google AI SDK의 에러 메시지나 상태 코드 기반)
        if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
            return new Response(JSON.stringify({ error: "AI 서비스 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ error: "죄송합니다. AI가 할 일을 분석하는 데 실패했습니다. 직접 입력하시거나 잠시 후 다시 시도해주세요." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
