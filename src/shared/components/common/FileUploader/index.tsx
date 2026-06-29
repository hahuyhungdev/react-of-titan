import { type DragEvent, useState, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import styles from "./styles.module.scss";

interface FileUploaderProps {
  onUploadComplete?: (url: string) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  label?: string;
}

/**
 * Shared FileUploader component.
 * Placed in shared/components/ (outside ui/) because it encapsulates complex
 * local state (upload progress, dragging state), file validation, drag-and-drop
 * browser events, and simulated network API requests.
 */
export function FileUploader({
  onUploadComplete,
  allowedTypes = ["image/png", "image/jpeg", "application/pdf"],
  maxSizeMb = 5,
  label = "Upload file",
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    if (!allowedTypes.includes(file.type)) {
      setError(`Unsupported file type. Allowed: ${allowedTypes.join(", ")}`);
      return false;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds limit of ${maxSizeMb}MB.`);
      return false;
    }
    return true;
  };

  const simulateUpload = (file: File) => {
    setFileName(file.name);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(null);
            if (onUploadComplete) {
              onUploadComplete(`https://fake-s3-upload-bucket.com/${file.name}`);
            }
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const triggerInputFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles["file-uploader"]}>
      <span className={styles["file-uploader-label"]}>{label}</span>

      <div
        className={cn(
          styles["file-uploader-dropzone"],
          isDragging && styles["file-uploader-dropzone-dragging"],
          progress !== null && styles["file-uploader-dropzone-uploading"],
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={allowedTypes.join(",")}
          className={styles["file-uploader-input"]}
        />

        {progress !== null ? (
          <div className={styles["file-uploader-status"]}>
            <Spinner size="md" />
            <p>
              Uploading {fileName} ({progress}%)
            </p>
            <progress
              className={styles["file-uploader-progress"]}
              max={100}
              value={progress}
              aria-label={`Upload progress for ${fileName}`}
            />
          </div>
        ) : (
          <div className={styles["file-uploader-prompt"]}>
            <p>Drag and drop your file here, or click to browse</p>
            <Button type="button" variant="secondary" onClick={triggerInputFile}>
              Select File
            </Button>
          </div>
        )}
      </div>

      {error && <span className={styles["file-uploader-error"]}>{error}</span>}
      {!error && fileName && progress === null && (
        <span className={styles["file-uploader-success"]}>Uploaded successfully: {fileName}</span>
      )}
    </div>
  );
}
