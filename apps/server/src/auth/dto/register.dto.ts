import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: "Иван Иванов" })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: "ivan@example.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "Password123" })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;
}
