import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
    constructor(private readonly prisma: PrismaService) {}

    // userId всегда берется из JWT, чтобы пользователь не мог управлять чужими адресами через body.
    findAll(userId: string) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
    }

    async create(userId: string, dto: CreateAddressDto) {
        const addressCount = await this.prisma.address.count({ where: { userId } });
        const shouldBeDefault = dto.isDefault ?? addressCount === 0;

        return this.prisma.$transaction(async (tx) => {
            if (shouldBeDefault) {
                await tx.address.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }

            return tx.address.create({
                data: {
                    userId,
                    label: dto.label,
                    city: dto.city,
                    street: dto.street,
                    house: dto.house,
                    apartment: dto.apartment,
                    zipCode: dto.zipCode,
                    isDefault: shouldBeDefault,
                },
            });
        });
    }

    async update(userId: string, addressId: string, dto: UpdateAddressDto) {
        await this.ensureAddressBelongsToUser(userId, addressId);

        return this.prisma.$transaction(async (tx) => {
            if (dto.isDefault) {
                await tx.address.updateMany({
                    where: { userId, id: { not: addressId } },
                    data: { isDefault: false },
                });
            }

            return tx.address.update({
                where: { id: addressId },
                data: dto,
            });
        });
    }

    async remove(userId: string, addressId: string) {
        const address = await this.ensureAddressBelongsToUser(userId, addressId);

        await this.prisma.address.delete({
            where: { id: addressId },
        });

        if (address.isDefault) {
            await this.promoteNewestAddressToDefault(userId);
        }

        return { deleted: true };
    }

    async setDefault(userId: string, addressId: string) {
        await this.ensureAddressBelongsToUser(userId, addressId);

        return this.prisma.$transaction(async (tx) => {
            await tx.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });

            return tx.address.update({
                where: { id: addressId },
                data: { isDefault: true },
            });
        });
    }

    private async ensureAddressBelongsToUser(userId: string, addressId: string) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });

        if (!address) {
            throw new NotFoundException("Address not found");
        }

        return address;
    }

    private async promoteNewestAddressToDefault(userId: string) {
        const newestAddress = await this.prisma.address.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        if (!newestAddress) {
            return;
        }

        await this.prisma.address.update({
            where: { id: newestAddress.id },
            data: { isDefault: true },
        });
    }
}
