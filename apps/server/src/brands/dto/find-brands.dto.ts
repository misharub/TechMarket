import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class FindBrandsDto {
    @ApiPropertyOptional({ example: "lenovo" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    includeInactive?: boolean;
}
