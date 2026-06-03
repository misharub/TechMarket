import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

function trimSingleLine(value: unknown) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value;
}

function normalizeEmail(value: unknown) {
    return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export class RegisterDto {
    @ApiProperty({ example: "Иван" })
    @Transform(({ value }) => trimSingleLine(value))
    @IsString()
    @MinLength(2)
    @MaxLength(60)
    firstName: string;

    @ApiProperty({ example: "Иванов" })
    @Transform(({ value }) => trimSingleLine(value))
    @IsString()
    @MinLength(2)
    @MaxLength(60)
    lastName: string;

    @ApiProperty({ example: "ivan@example.com" })
    @Transform(({ value }) => normalizeEmail(value))
    @IsEmail()
    email: string;

    @ApiProperty({ example: "Password123" })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;
}
