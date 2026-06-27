import { TaskItem } from "./components/TaskItem";
import { useTasks } from "./hooks/useTasks";

export function TaskBoard() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) return <div className="page-loading">Loading tasks…</div>;
  if (error) {
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section className="task-board-section" aria-label="Task board">
      <div className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export default TaskBoard;
