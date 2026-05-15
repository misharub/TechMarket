import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class CreateCategoryCollectionDto {
    @ApiProperty({ example: "Игровые ноутбуки" })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: "gaming-notebooks" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;

    @ApiProperty({ example: { specs: { purpose: "gaming" } } })
    @IsObject()
    conditions: Record<string, unknown>;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
