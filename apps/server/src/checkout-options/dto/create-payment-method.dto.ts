import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from "class-validator";

export class CreatePaymentMethodDto {
    @ApiProperty({ example: "cash_on_delivery" })
    @IsString()
    @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
    code: string;

    @ApiProperty({ example: "Cash on delivery" })
    @IsString()
    @MaxLength(120)
    name: string;

    @ApiPropertyOptional({ example: "Payment when receiving the order." })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

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
