import {
    BadRequestException,
    Controller,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { diskStorage } from "multer";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UploadImageQueryDto } from "./dto/upload-image-query.dto";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES, UPLOADS_ROOT, UPLOAD_TYPES } from "./uploads.constants";
import type { UploadType } from "./uploads.constants";
import { UploadsService } from "./uploads.service";

@ApiTags("Uploads")
@Controller("uploads")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Post("image")
    @ApiOperation({ summary: "Загрузить изображение для товара, категории или бренда. Только ADMIN" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
            required: ["file"],
        },
    })
    @UseInterceptors(
        FileInterceptor("file", {
            limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
            fileFilter: (request, file, callback) => {
                if (request.query.type && !isUploadType(request.query.type)) {
                    callback(new BadRequestException("Invalid upload type"), false);
                    return;
                }

                if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
                    callback(new BadRequestException("Only jpeg, png, webp and gif images are allowed"), false);
                    return;
                }

                callback(null, true);
            },
            storage: diskStorage({
                destination: (request, file, callback) => {
                    const type = getUploadType(request.query.type);
                    const destination = join(UPLOADS_ROOT, type);
                    mkdirSync(destination, { recursive: true });
                    callback(null, destination);
                },
                filename: (request, file, callback) => {
                    const extension = extname(file.originalname).toLowerCase();
                    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
                },
            }),
        }),
    )
    uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Query() query: UploadImageQueryDto,
    ) {
        const type = query.type ?? "general";
        this.uploadsService.validateImage(file);

        return this.uploadsService.buildImageResponse(file, type);
    }
}

function getUploadType(value: unknown): UploadType {
    return isUploadType(value) ? value : "general";
}

function isUploadType(value: unknown): value is UploadType {
    return typeof value === "string" && UPLOAD_TYPES.includes(value as UploadType);
}
