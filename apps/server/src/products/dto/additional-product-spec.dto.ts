import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class AdditionalProductSpecDto {
    @ApiProperty({ example: "Комплектация" })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    label: string;

    @ApiProperty({ example: "Зарядка 67W" })
    @IsString()
    @MinLength(1)
    @MaxLength(300)
    value: string;
}
