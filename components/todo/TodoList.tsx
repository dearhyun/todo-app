import { Todo, Priority } from "@/lib/types/todo";
import { TodoCard } from "./TodoCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TodoListProps {
    todos: Todo[];
    isLoading?: boolean;
    onToggle?: (id: string, isCompleted: boolean) => void;
    onEdit?: (todo: Todo) => void;
    onDelete?: (id: string) => void;
    onPriorityChange?: (id: string, priority: Priority) => void;
}

/**
 * 할 일 목록을 그리드 레이아웃으로 표시합니다.
 * 로딩 상태일 때는 스켈레톤 UI를 보여주며, 데이터가 없을 때는 안내 문구를 표시합니다.
 */
export const TodoList = ({ todos, isLoading, onToggle, onEdit, onDelete, onPriorityChange }: TodoListProps) => {
    if (isLoading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[200px] w-full rounded-[2rem]" />
                ))}
            </div>
        );
    }

    if (todos.length === 0) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <p className="text-2xl font-black text-zinc-300 dark:text-zinc-700">비어 있습니다</p>
                <p className="text-zinc-400 dark:text-zinc-500 mt-2 font-medium">새로운 업무를 정의하고 바로 시작해보세요!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {todos.map((todo) => (
                <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onPriorityChange={onPriorityChange}
                    onClick={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
