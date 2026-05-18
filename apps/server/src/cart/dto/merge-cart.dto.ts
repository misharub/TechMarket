import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class MergeCartItemDto {
    @ApiProperty({ example: "product-id" })
    @IsString()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isSelected?: boolean;
}

export class MergeCartDto {
    @ApiProperty({ type: [MergeCartItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MergeCartItemDto)
    items: MergeCartItemDto[];
}
