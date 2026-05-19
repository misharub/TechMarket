import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export enum ProductSort {
    NEWEST = "newest",
    PRICE_ASC = "priceAsc",
    PRICE_DESC = "priceDesc",
    TITLE_ASC = "titleAsc",
}

export class FindProductsDto {
    @ApiPropertyOptional({ example: "lenovo" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: "category-id" })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ example: "laptops-computers" })
    @IsOptional()
    @IsString()
    categorySlug?: string;

    @ApiPropertyOptional({ example: "gaming-notebooks" })
    @IsOptional()
    @IsString()
    collectionSlug?: string;

    @ApiPropertyOptional({ example: "brand-id" })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({ example: "os:Android|ramGb:8|wirelessCharging:true" })
    @IsOptional()
    @IsString()
    specFilters?: string;

    @ApiPropertyOptional({ example: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    priceFrom?: number;

    @ApiPropertyOptional({ example: 3000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    priceTo?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    inStock?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    includeInactive?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    isActive?: boolean;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 12 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(48)
    limit?: number;

    @ApiPropertyOptional({ enum: ProductSort, example: ProductSort.NEWEST })
    @IsOptional()
    @IsEnum(ProductSort)
    sort?: ProductSort;
}
