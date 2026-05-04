import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

// DTO описывает данные бренда и помогает ValidationPipe отсеять неверный запрос до service.
export class CreateBrandDto {
    @ApiProperty({ example: "Lenovo" })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    name: string;

    @ApiProperty({ example: "lenovo" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;

    @ApiPropertyOptional({ example: "Производитель ноутбуков, ПК и компьютерной техники." })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ example: "/uploads/brands/lenovo.svg" })
    @IsOptional()
    @IsString()
    logo?: string;
}
