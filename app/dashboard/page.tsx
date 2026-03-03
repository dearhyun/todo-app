import { Dashboard } from "@/components/features/Dashboard";

/**
 * 대시보드 메인 화면 컴포넌트입니다.
 * 로그인된 사용자만 접근 가능하며, 할 일 목록 관리 기능을 제공합니다.
 */
const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-20 pb-10">
            <Dashboard />
        </div>
    );
};

export default DashboardPage;
