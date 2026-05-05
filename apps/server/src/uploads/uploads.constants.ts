import { join } from "node:path";

export const UPLOADS_ROOT = join(process.cwd(), "../../uploads");
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const UPLOAD_TYPES = ["products", "categories", "brands", "general"] as const;

export type UploadType = (typeof UPLOAD_TYPES)[number];
