import { BadRequestException, Controller, Get, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import type { Response } from "express";
import { memoryStorage } from "multer";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CatalogExchangeService } from "./catalog-exchange.service";

@ApiTags("Catalog exchange")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class CatalogExchangeController {
    constructor(private readonly catalogExchangeService: CatalogExchangeService) {}

    @Get("export/products")
    @ApiOperation({ summary: "Export products to CSV, only ADMIN" })
    async exportProducts(@Res() response: Response) {
        const csv = await this.catalogExchangeService.exportProductsCsv();
        this.sendCsv(response, "techmarket-products.csv", csv);
    }

    @Get("export/orders")
    @ApiOperation({ summary: "Export orders to CSV, only ADMIN" })
    async exportOrders(@Res() response: Response) {
        const csv = await this.catalogExchangeService.exportOrdersCsv();
        this.sendCsv(response, "techmarket-orders.csv", csv);
    }

    @Post("import/products")
    @ApiOperation({ summary: "Import products from CSV by sku, only ADMIN" })
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
            storage: memoryStorage(),
            limits: { fileSize: 2 * 1024 * 1024 },
            fileFilter: (request, file, callback) => {
                if (!file.originalname.toLowerCase().endsWith(".csv") && file.mimetype !== "text/csv") {
                    callback(new BadRequestException("Only CSV files are allowed"), false);
                    return;
                }

                callback(null, true);
            },
        }),
    )
    importProducts(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("CSV file is required");
        }

        return this.catalogExchangeService.importProductsCsv(file.buffer.toString("utf8"));
    }

    private sendCsv(response: Response, filename: string, csv: string) {
        response.setHeader("Content-Type", "text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        response.send(csv);
    }
}
