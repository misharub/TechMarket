import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateHomeSliderDto {
    @ApiProperty({ example: "Умная витрина TechMarket" })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    kicker: string;

    @ApiProperty({ example: "Техника для работы, учебы и дома без лишнего шума" })
    @IsString()
    @MinLength(4)
    @MaxLength(140)
    title: string;

    @ApiProperty({ example: "Главная собирает категории, новинки и скидки прямо из API." })
    @IsString()
    @MinLength(4)
    @MaxLength(260)
    description: string;

    @ApiPropertyOptional({ example: "7" })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    primaryText?: string;

    @ApiPropertyOptional({ example: "разделов" })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    primaryLabel?: string;

    @ApiPropertyOptional({ example: "3 300 Br" })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    secondaryText?: string;

    @ApiPropertyOptional({ example: "выгодное предложение" })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    secondaryLabel?: string;

    @ApiProperty({ example: "Price watch" })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    panelKicker: string;

    @ApiProperty({ example: "Apple iPhone 16 256 ГБ" })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    panelTitle: string;

    @ApiProperty({ example: "3 300 Br в наличии. Старая цена учитывается автоматически." })
    @IsString()
    @MinLength(2)
    @MaxLength(220)
    panelDescription: string;

    @ApiPropertyOptional({ example: "/uploads/general/banner.png" })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
