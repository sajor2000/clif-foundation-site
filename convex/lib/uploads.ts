/** Board documents (990s, minutes, policies, statements) stay well under this. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/heic": [".heic"],
  "application/zip": [".zip"],
};

/** Value for the file input's `accept` attribute (MIME types plus extensions). */
export const ACCEPTED_UPLOAD_TYPES = Object.entries(ALLOWED_TYPES)
  .flatMap(([type, exts]) => [type, ...exts])
  .join(",");

/** Why an upload is refused, or null if it is acceptable. */
export function uploadRejection(size: number, contentType: string): string | null {
  if (size <= 0) return "The file is empty.";
  if (size > MAX_UPLOAD_BYTES) {
    return `The file is larger than ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`;
  }
  const type = contentType.split(";")[0].trim().toLowerCase();
  if (!(type in ALLOWED_TYPES)) {
    return "This file type is not allowed. Upload a PDF, Office document, CSV, text file, image, or ZIP.";
  }
  return null;
}
