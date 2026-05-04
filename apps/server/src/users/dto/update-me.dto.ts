import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateMeDto {
    @ApiPropertyOptional({ example: "Иван Иванов" })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: "+375291112233" })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;
}
