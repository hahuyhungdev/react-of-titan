// entities/user — entity dùng chung bởi nhiều features (auth, profile, admin...).
// Chỉ chứa: type + pure functions trên entity. KHÔNG chứa UI, KHÔNG gọi API.

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "member";
  avatarUrl: string | null;
};

export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function isAdmin(user: User): boolean {
  return user.role === "admin";
}
