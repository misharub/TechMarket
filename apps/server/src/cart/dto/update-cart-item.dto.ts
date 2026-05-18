import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class UpdateCartItemDto {
    @ApiProperty({ example: 3 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isSelected?: boolean;
}
