import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiProperty({
        required: false,
        example: "Покупатель подтвердил заказ по телефону",
        description: "Внутренний комментарий администратора к изменению статуса.",
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    adminComment?: string;
}
