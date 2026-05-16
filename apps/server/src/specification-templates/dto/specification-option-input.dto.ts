import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class SpecificationOptionInputDto {
    @ApiPropertyOptional({ example: "option_1" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "IPS" })
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    value: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
