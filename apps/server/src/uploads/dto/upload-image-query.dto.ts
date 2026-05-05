import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { UPLOAD_TYPES } from "../uploads.constants";
import type { UploadType } from "../uploads.constants";

export class UploadImageQueryDto {
    @ApiPropertyOptional({
        enum: UPLOAD_TYPES,
        default: "general",
        description: "Папка внутри /uploads, куда будет сохранено изображение.",
    })
    @IsOptional()
    @IsIn(UPLOAD_TYPES)
    type?: UploadType;
}
