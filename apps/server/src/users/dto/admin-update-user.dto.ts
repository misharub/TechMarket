import { ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AdminUpdateUserDto {
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

    @ApiPropertyOptional({ enum: Role, example: Role.ADMIN })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isBlocked?: boolean;
}
