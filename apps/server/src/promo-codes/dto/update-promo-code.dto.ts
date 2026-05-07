import { ApiPropertyOptional } from "@nestjs/swagger";
import { DiscountType } from "@prisma/client";
import { Type } from "class-transformer";
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from "class-validator";

export class UpdatePromoCodeDto {
    @ApiPropertyOptional({ example: "WELCOME10" })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    @Matches(/^[A-Za-z0-9_-]+$/)
    code?: string;

    @ApiPropertyOptional({ example: "Скидка 10% для демонстрации" })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.PERCENT })
    @IsOptional()
    @IsEnum(DiscountType)
    discountType?: DiscountType;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    value?: number;

    @ApiPropertyOptional({ example: 300 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    maxDiscount?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderTotal?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsInt()
    @Min(1)
    usageLimit?: number;

    @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startsAt?: Date;

    @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endsAt?: Date;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
