import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CompareProductsDto } from "./dto/compare-products.dto";
import { ProductCompareService } from "./product-compare.service";

@ApiTags("Product compare")
@Controller("products/compare")
export class ProductCompareController {
    constructor(private readonly productCompareService: ProductCompareService) {}

    @Post()
    @ApiOperation({ summary: "Сравнить 2-3 товара одной категории" })
    compare(@Body() dto: CompareProductsDto) {
        return this.productCompareService.compare(dto);
    }
}
