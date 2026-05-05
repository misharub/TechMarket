import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsString } from "class-validator";

export class CompareProductsDto {
    @ApiProperty({ example: ["product-id-1", "product-id-2"] })
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(3)
    @ArrayUnique()
    @IsString({ each: true })
    productIds: string[];
}
