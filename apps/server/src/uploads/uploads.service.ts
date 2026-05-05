import { BadRequestException, Injectable } from "@nestjs/common";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "./uploads.constants";
import type { UploadType } from "./uploads.constants";

@Injectable()
export class UploadsService {
    // Service не сохраняет файл сам: это уже сделал FileInterceptor. Здесь мы формируем стабильный ответ для frontend.
    buildImageResponse(file: Express.Multer.File, type: UploadType) {
        if (!file) {
            throw new BadRequestException("Image file is required");
        }

        return {
            url: `/uploads/${type}/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
        };
    }

    validateImage(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("Image file is required");
        }

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException("Only jpeg, png, webp and gif images are allowed");
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            throw new BadRequestException("Image size must not exceed 5 MB");
        }
    }
}
