import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from "class-validator";

export class CreateDeliveryMethodDto {
    @ApiProperty({ example: "courier" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
    code: string;

    @ApiProperty({ example: "Courier delivery" })
    @IsString()
    @MaxLength(120)
    name: string;

    @ApiPropertyOptional({ example: "Delivery to the customer address." })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ example: 15 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderTotal?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
