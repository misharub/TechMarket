import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
    @ApiProperty({ example: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({ example: "Хороший товар, быстрая доставка." })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comment?: string;
}
