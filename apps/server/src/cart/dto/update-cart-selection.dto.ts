import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateCartSelectionDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    isSelected: boolean;

    @ApiPropertyOptional({ example: ["cart-item-id"] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    itemIds?: string[];
}
