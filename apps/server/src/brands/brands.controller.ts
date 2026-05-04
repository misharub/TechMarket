import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { FindBrandsDto } from "./dto/find-brands.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@ApiTags("Brands")
@Controller("brands")
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    @ApiOperation({ summary: "Получить список брендов" })
    findAll(@Query() query: FindBrandsDto) {
        return this.brandsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Получить бренд по id" })
    findOne(@Param("id") id: string) {
        return this.brandsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: "Создать бренд" })
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Обновить бренд" })
    update(@Param("id") id: string, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Скрыть бренд" })
    remove(@Param("id") id: string) {
        return this.brandsService.remove(id);
    }
}
