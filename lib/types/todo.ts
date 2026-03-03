// 서비스 전역에서 사용되는 할 일 관련 타입 정의입니다.

export type Priority = "low" | "medium" | "high" | "urgent";
export type TodoStatus = "todo" | "in_progress" | "done";

export interface Todo {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    created_at: string;
    due_date?: string;
    due_time?: string;
    priority: Priority;
    category?: string;
    is_completed: boolean;
    status: TodoStatus;
    assignee?: string;
    color?: string;
    updated_at: string;
}
