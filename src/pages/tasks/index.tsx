import { TaskBoard } from "@/features/task-board";

export function TasksPage() {
  return (
    <div className="page tasks-page">
      <h1>Task Board</h1>
      <TaskBoard />
    </div>
  );
}

export default TasksPage;
