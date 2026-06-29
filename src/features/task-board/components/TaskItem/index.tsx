import { cn } from "@/shared/utils/cn";
import type { Task } from "../../types/task.types";
import styles from "../../styles.module.scss";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className={styles["task-item"]}>
      <span
        className={cn(styles["task-title"], task.status === "done" && styles["task-title-done"])}
      >
        {task.title}
      </span>
      <span className={cn(styles["task-status"], styles[`task-status-${task.status}`])}>
        {task.status.toUpperCase()}
      </span>
    </div>
  );
}
