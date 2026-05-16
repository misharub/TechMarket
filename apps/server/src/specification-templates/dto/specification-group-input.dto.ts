import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { SpecificationInputDto } from "./specification-input.dto";

export class SpecificationGroupInputDto {
    @ApiPropertyOptional({ example: "group_1" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "Экран" })
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    name: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ type: [SpecificationInputDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpecificationInputDto)
    specifications?: SpecificationInputDto[];
}
