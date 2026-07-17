// infrastructure/aws/storage.ts — ADAPTER PATTERN cho AWS S3.
//
// Nguyên tắc:
// 1. @aws-sdk/* CHỈ được import ở đây (ESLint enforce) — vendor không rò rỉ ra features.
// 2. Frontend KHÔNG giữ AWS credentials. Upload qua PRESIGNED URL do backend cấp.
// 3. Features chỉ thấy interface `uploadFile(file) → url` — không biết S3 tồn tại.
//    Ngày mai đổi sang GCS/R2: sửa MỖI file này.

import { httpClient } from "@/infrastructure/http/client";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
};

/**
 * Upload file lên object storage.
 * Flow: xin presigned URL từ backend → PUT thẳng lên S3 → trả về public URL.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  // Backend ký URL bằng credentials của NÓ — frontend không đụng secret
  const { uploadUrl, publicUrl } = await httpClient.post<PresignResponse>(
    "/storage/presign",
    {
      fileName: file.name,
      contentType: file.type,
      folder,
    },
  );

  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

  return publicUrl;
}
