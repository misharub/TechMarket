import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CheckoutOrderDto {
    @ApiProperty({ example: "Иван Иванов" })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    customerName: string;

    @ApiProperty({ example: "+375291112233" })
    @IsString()
    @MinLength(5)
    @MaxLength(30)
    customerPhone: string;

    @ApiProperty({ example: "ivan@example.com" })
    @IsEmail()
    customerEmail: string;

    @ApiPropertyOptional({ example: "address-id" })
    @IsOptional()
    @IsString()
    addressId?: string;

    @ApiPropertyOptional({ example: "pickup-point-id" })
    @IsOptional()
    @IsString()
    pickupPointId?: string;

    @ApiPropertyOptional({ example: "Ivan Ivanov" })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    recipientName?: string;

    @ApiPropertyOptional({ example: "Minsk" })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    pickupCity?: string;

    @ApiPropertyOptional({ example: "67" })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    pickupNumber?: string;

    @ApiPropertyOptional({ example: "Минск" })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    city?: string;

    @ApiPropertyOptional({ example: "ул. Ленина, 10-15" })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    deliveryAddress?: string;

    @ApiProperty({ example: "courier" })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    deliveryMethod: string;

    @ApiProperty({ example: "cash_on_delivery" })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    paymentMethod: string;

    @ApiPropertyOptional({ example: "WELCOME10" })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    promoCode?: string;

    @ApiPropertyOptional({ example: "Позвонить за час до доставки" })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    comment?: string;
}
