import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SpecValueType } from "@prisma/client";
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from "class-validator";
import { SpecificationOptionInputDto } from "./specification-option-input.dto";

export class SpecificationInputDto {
    @ApiPropertyOptional({ example: "spec_1" })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ example: "Диагональ" })
    @IsString()
    @MinLength(1)
    @MaxLength(140)
    name: string;

    @ApiProperty({ enum: SpecValueType, example: SpecValueType.NUMBER })
    @IsEnum(SpecValueType)
    type: SpecValueType;

    @ApiPropertyOptional({ example: "дюйм" })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    unit?: string | null;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

    @ApiPropertyOptional({ type: [SpecificationOptionInputDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpecificationOptionInputDto)
    options?: SpecificationOptionInputDto[];
}
