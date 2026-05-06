import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAddressDto {
    @ApiPropertyOptional({ example: "Дом" })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    label?: string;

    @ApiProperty({ example: "Минск" })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    city: string;

    @ApiProperty({ example: "ул. Ленина" })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    street: string;

    @ApiProperty({ example: "10" })
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    house: string;

    @ApiPropertyOptional({ example: "15" })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    apartment?: string;

    @ApiPropertyOptional({ example: "220030" })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    zipCode?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
