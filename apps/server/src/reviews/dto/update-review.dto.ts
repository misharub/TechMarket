import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateReviewDto {
    @ApiPropertyOptional({ example: 4 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ example: "После недели использования оценку немного снизил." })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string;
}
