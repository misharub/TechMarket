import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

// DTO описывает данные, которые клиент может отправить при создании категории.
// ValidationPipe использует эти правила и не пропускает некорректный запрос в service.
export class CreateCategoryDto {
    @ApiProperty({ example: "Ноутбуки и компьютеры" })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: "laptops-computers" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;

    @ApiPropertyOptional({ example: "Ноутбуки, ПК, моноблоки и аксессуары" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: "https://example.com/category.jpg" })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ example: "clw..." })
    @IsOptional()
    @IsString()
    parentId?: string;
}
