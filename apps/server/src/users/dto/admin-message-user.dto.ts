import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class AdminMessageUserDto {
    @ApiProperty({ example: "Важное сообщение" })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    title: string;

    @ApiProperty({ example: "Ваш аккаунт проверен администратором." })
    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    message: string;
}
