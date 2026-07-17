// shared/config/env.ts — validate env MỘT LẦN ở boundary, sau đó cả app dùng typed object.
// Không rải import.meta.env khắp codebase.
import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
