import type { Task } from "../../types/task.types";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div
      className="task-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-md)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-raised)",
        marginBottom: "var(--space-sm)",
      }}
    >
      <span
        style={{
          textDecoration: task.status === "done" ? "line-through" : "none",
          color: task.status === "done" ? "var(--color-text-muted)" : "var(--color-text)",
        }}
      >
        {task.title}
      </span>
      <span
        style={{
          fontSize: "var(--text-xs)",
          padding: "var(--space-xs) var(--space-sm)",
          borderRadius: "var(--radius-sm)",
          background: task.status === "done" ? "#10b981" : "#f59e0b",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        {task.status.toUpperCase()}
      </span>
    </div>
  );
}
