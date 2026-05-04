import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SpecValueType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

// DTO нужен, чтобы ValidationPipe проверил данные характеристики до попадания в service.
export class CreateCategorySpecDto {
    @ApiProperty({
        example: "ram",
        description: "Технический ключ на английском. Используется в коде, API и будущих характеристиках товара.",
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @Matches(/^[a-z][a-zA-Z0-9]*$/)
    key: string;

    @ApiProperty({ example: "Оперативная память", description: "Название поля, которое увидит пользователь." })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    label: string;

    @ApiProperty({ enum: SpecValueType, example: SpecValueType.NUMBER })
    @IsEnum(SpecValueType)
    type: SpecValueType;

    @ApiPropertyOptional({ example: "GB", description: "Единица измерения, если она нужна для характеристики." })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    unit?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @ApiPropertyOptional({
        example: true,
        description: "Если true, эту характеристику можно использовать в таблице сравнения товаров.",
    })
    @IsOptional()
    @IsBoolean()
    isComparable?: boolean;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({
        example: "Введите число без единицы измерения. Например: 16.",
        description: "Подсказка для администратора при заполнении товара.",
    })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    helpText?: string;
}
