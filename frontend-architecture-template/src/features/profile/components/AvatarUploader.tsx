// AvatarUploader — DEMO AWS PATTERN:
// Feature gọi uploadFile() từ infrastructure — KHÔNG biết S3/presigned URL tồn tại.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/infrastructure/aws/storage";
import { httpClient } from "@/infrastructure/http/client";
import { notify } from "@/features/notifications/model/notifications.store";
import { Button } from "@/shared/components/ui/button/Button";
import { useRef } from "react";

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const avatarUrl = await uploadFile(file, "avatars");
      await httpClient.put("/profile/avatar", { avatarUrl });
      return avatarUrl;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notify({ type: "success", message: "Đã cập nhật ảnh đại diện" });
    },
    onError: () => notify({ type: "error", message: "Upload thất bại" }),
  });

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
        }}
      />
      <Button
        variant="secondary"
        isLoading={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        Đổi ảnh đại diện
      </Button>
    </>
  );
}
