// auth/model/login.schema.ts — Zod schema LÀ business logic → sống trong feature,
// KHÔNG phải shared/ hay components/.
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
