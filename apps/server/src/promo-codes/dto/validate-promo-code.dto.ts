import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength } from "class-validator";

export class ValidatePromoCodeDto {
    @ApiProperty({ example: "WELCOME10" })
    @IsString()
    @MaxLength(40)
    @Matches(/^[A-Za-z0-9_-]+$/)
    code: string;
}
