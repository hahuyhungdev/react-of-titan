import { useState, useEffect } from "react";
import type { Task } from "../types/task.types";

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Complete project documentation", status: "done" },
  { id: "2", title: "Implement task board feature", status: "todo" },
  { id: "3", title: "Write unit and integration tests", status: "todo" },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!cancelled) setTasks(MOCK_TASKS);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tasks, isLoading, error };
}
