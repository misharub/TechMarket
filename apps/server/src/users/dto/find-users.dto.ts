import { ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export class FindUsersDto {
    @ApiPropertyOptional({ example: "ivan@example.com" })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: Role, example: Role.USER })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    isBlocked?: boolean;
}
