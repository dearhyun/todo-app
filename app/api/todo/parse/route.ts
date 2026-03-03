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
                title: z.string(),
                due_date: z.string(),
                due_time: z.string(),
                priority: z.enum(["low", "medium", "high", "urgent"]),
                category: z.string(),
            }),
            prompt: `
            사용자의 할 일을 분석하여 구조화된 JSON 데이터로 변환해주세요.
            
            입력 텍스트: "${text}"
            현재 기준 시각: ${currentDate} ${currentTime}
            
            [분석 규칙]
            1. 날짜 처리: 오늘(${currentDate}), 내일, 모레, 이번 주/다음 주 요일 대응
            2. 시간 처리: 아침(09:00), 점심(12:00), 오후(14:00), 저녁(18:00), 밤(21:00) 대응
            3. 우선순위: urgent(긴급, 최우선), high(중요한, 빨리, 꼭), medium(보통), low(천천히, 여유롭게)
            4. 카테고리: 스터디(학습, 책), 컨설팅(업무, 보고서, 회의), 개인(친구, 가족), 건강(운동, 병원) 우선 분류
            `,
        });

        // 4. 후처리 (Post-processing)
        let parsed = { ...object };

        // 4.1 날짜 보정: 생성된 날짜가 과거라면 오늘로 설정
        const targetDate = new Date(parsed.due_date);
        const todayReset = new Date(currentDate);
        if (targetDate < todayReset) {
            parsed.due_date = currentDate;
        }

        // 4.2 제목 길이 조정
        if (parsed.title.length > 50) {
            parsed.title = parsed.title.substring(0, 47) + "...";
        } else if (parsed.title.length < 1) {
            parsed.title = text.substring(0, 20); // 제목 추출 실패 시 원본 일부 사용
        }

        // 4.3 필수 필드 기본값 보장 (Schema에서 이미 보장되지만 논리적 최종 확인)
        parsed.due_time = parsed.due_time || "09:00";
        parsed.priority = parsed.priority || "medium";
        parsed.category = parsed.category || "기타";

        return new Response(JSON.stringify(parsed), {
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
