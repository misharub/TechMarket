import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AddWishlistItemDto {
    @ApiProperty({ example: "product-id" })
    @IsString()
    productId: string;
}
