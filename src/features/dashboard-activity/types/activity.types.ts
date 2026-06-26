export interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning";
}
