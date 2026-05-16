import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { SpecificationGroupInputDto } from "./specification-group-input.dto";

export class CreateSpecificationTemplateDto {
    @ApiProperty({ example: "Характеристики смартфона" })
    @IsString()
    @MinLength(1)
    @MaxLength(160)
    name: string;

    @ApiProperty({ example: "category_1" })
    @IsString()
    categoryId: string;

    @ApiProperty({ type: [SpecificationGroupInputDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpecificationGroupInputDto)
    groups: SpecificationGroupInputDto[];
}
