import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    ArrayMaxSize,
    IsArray,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from "class-validator";

// Product DTO описывает карточку товара. specs проверяются глубже уже в service по шаблону категории.
export class CreateProductDto {
    @ApiProperty({ example: "Lenovo IdeaPad 5 16" })
    @IsString()
    @MinLength(3)
    @MaxLength(160)
    title: string;

    @ApiProperty({ example: "lenovo-ideapad-5-16" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;

    @ApiProperty({ example: "NB-LEN-0001" })
    @IsString()
    @MinLength(3)
    @MaxLength(60)
    sku: string;

    @ApiProperty({ example: "Ноутбук для учебы, работы и мультимедиа." })
    @IsString()
    @MinLength(10)
    description: string;

    @ApiProperty({ example: 2599.99 })
    @IsNumber()
    @Min(0.01)
    price: number;

    @ApiPropertyOptional({ example: 2899.99 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    oldPrice?: number;

    @ApiProperty({ example: "category-id" })
    @IsString()
    categoryId: string;

    @ApiProperty({ example: "brand-id" })
    @IsString()
    brandId: string;

    @ApiPropertyOptional({ example: 12 })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ example: ["/uploads/products/lenovo-ideapad-5.jpg"] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @IsString({ each: true })
    images?: string[];

    @ApiProperty({ example: { screenSize: 16, processor: "Intel Core i5", ram: 16, ssd: 512 } })
    @IsObject()
    specs: Record<string, unknown>;
}
