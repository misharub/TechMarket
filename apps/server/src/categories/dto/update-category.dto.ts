import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { CreateCategoryDto } from "./create-category.dto";

// PartialType делает все поля CreateCategoryDto необязательными для PATCH-запроса.
export class UpdateCategoryDto extends PartialType(OmitType(CreateCategoryDto, ["parentId"] as const)) {
    @ApiPropertyOptional({ example: null, nullable: true })
    @IsOptional()
    @IsString()
    parentId?: string | null;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
