import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { FindBrandsDto } from "./dto/find-brands.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandsService {
    constructor(private readonly prisma: PrismaService) {}

    // Справочник брендов нужен каталогу для фильтров и форме создания товара.
    findAll(query: FindBrandsDto) {
        return this.prisma.brand.findMany({
            where: this.buildWhere(query),
            orderBy: { name: "asc" },
        });
    }

    async findOne(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
        });

        if (!brand) {
            throw new NotFoundException("Brand not found");
        }

        return brand;
    }

    async create(dto: CreateBrandDto) {
        try {
            return await this.prisma.brand.create({
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: string, dto: UpdateBrandDto) {
        await this.ensureBrandExists(id);

        try {
            return await this.prisma.brand.update({
                where: { id },
                data: dto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: string) {
        await this.ensureBrandExists(id);

        // Мягкое удаление скрывает бренд, но не ломает будущие связи с товарами.
        return this.prisma.brand.update({
            where: { id },
            data: { isActive: false },
        });
    }

    private buildWhere(query: FindBrandsDto): Prisma.BrandWhereInput {
        return {
            ...(query.includeInactive ? {} : { isActive: true }),
            ...(query.search
                ? {
                      OR: [
                          { name: { contains: query.search, mode: "insensitive" } },
                          { slug: { contains: query.search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };
    }

    private async ensureBrandExists(id: string) {
        const brand = await this.prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!brand) {
            throw new NotFoundException("Brand not found");
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictException("Brand slug already exists");
        }

        throw error;
    }
}
