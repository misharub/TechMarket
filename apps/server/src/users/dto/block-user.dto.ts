import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class BlockUserDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    isBlocked: boolean;
}
