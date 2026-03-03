---
name: project-rules
description: AI TODO 웹 서비스 프로젝트의 코딩 규칙과 사용자 경험(UX) 표준을 강제하는 스킬입니다.
---

# AI TODO 웹 서비스 코딩 규칙 (PROJECT-RULES)

본 스킬은 "AI TODO 웹 서비스" 프로젝트 내에서 일관된 코드 품질과 프리미엄 사용자 경험을 보장하기 위한 가이드를 제공합니다. 모든 개발 작업 시 아래의 규칙을 엄격히 준수하십시오.

## 1. 프로젝트 철학 및 UX (Premium UX)
- **상태 처리**: 모든 비동기 동작에 `loading` (Skeleton 선호), `empty`, `error` UI를 반드시 구현합니다.
- **피드백**: 성공/오류 시 `sonner`를 사용하여 한글로 된 인터랙티브 토스트 알림을 제공합니다.
- **디자인**: `Tailwind CSS`를 활용하여 현대적이고 세련된 디자인(Gradients, Glassmorphism, Smooth transitions)을 적용합니다.
- **접근성/다크모드**: `next-themes`를 활용하여 다크 모드에서도 완벽한 가독성을 유지합니다.
- **오류 메시지**: 사용자용 오류 메시지는 반드시 **한글**로 친절하게 작성합니다.

## 2. 기술 스택 표준
- **Framework**: Next.js 16 (App Router)
- **TypeScript**: `strict` 모드 준수가 원칙입니다.
- **AI**: Vercel AI SDK 등 명시된 AI 라이브러리를 사용합니다.
- **Forms**: react-hook-form + zod (스키마 기반 엄격한 검증)
- **Styling/UI**: Tailwind CSS & Shadcn/ui
- **Icons**: lucide-react (일관된 디자인 스타일 유지)

## 3. 코딩 컨벤션 및 문서화 (Clean Code)
- **함수 정의**: 모든 컴포넌트와 유틸리티 함수는 **화살표 함수(`const Func = () => ...`)** 형식을 사용합니다.
- **파일명**: 컴포넌트는 **파스칼 케이스(PascalCase.tsx)**, 유틸리티/훅은 **카멜 케이스(camelCase.ts)**를 따릅니다.
- **문서화 (Essential)**:
    - **Top Summary**: 모든 파일 첫 줄에 해당 파일의 역할을 **한글 한 문장**으로 간단히 요약(`// 파일_역할_요약`)하여 작성합니다.
    - **Korean JSDoc**: 모든 함수와 컴포넌트 상단에는 `/** ... */` 형식의 JSDoc을 **한글**로 작성합니다.
- **Prop Interface**: `interface ComponentNameProps { ... }` 형식을 사용하여 타입을 명시적으로 정의합니다.

## 4. 디렉토리 및 아키텍처
- `app/`: 페이지 및 라우팅 로직
- `components/features/`: 비즈니스 로직이 포함된 도메인별 컴포넌트
- `components/shared/`: 범용적으로 재사용 가능한 컴포넌트
- `components/ui/`: Shadcn 기반의 기본 원자 요소
- `lib/`: 유틸리티 함수 및 공통 설정

## 5. 적용 및 검증
1. 새로운 기능을 추가할 때 상기 기술 스택과 아키텍처를 확인합니다.
2. 파일 작성 시 상단 요약과 JSDoc 문서화를 즉시 수행합니다.
3. `development` 환경에서는 상세 로그를 남기고, 배포 환경에서는 보안과 성능에 최적화된 코드를 보장합니다.
