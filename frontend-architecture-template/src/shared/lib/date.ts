// shared/lib/date.ts — chỉ chứa hàm GENERIC.
// Test nhanh: có từ nghiệp vụ trong tên không? formatInvoiceDate → KHÔNG được ở đây.

export function formatDate(date: Date, locale = "vi-VN"): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}
