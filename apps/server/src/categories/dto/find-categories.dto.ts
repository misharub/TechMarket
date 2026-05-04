import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

// Query DTO описывает параметры строки запроса: /categories?parentId=...&includeInactive=true
export class FindCategoriesDto {
    @ApiPropertyOptional({ example: "clw..." })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    includeInactive?: boolean;
}
