import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateHomeSliderDto } from "./dto/update-home-slider.dto";

const defaultSlider = {
    id: "default",
    kicker: "Умная витрина TechMarket",
    title: "Техника для работы, учебы и дома без лишнего шума",
    description:
        "Главная собирает категории, новинки и скидки прямо из API. Видны наличие, цена, рейтинг и быстрый переход в каталог.",
    primaryText: null,
    primaryLabel: null,
    secondaryText: null,
    secondaryLabel: null,
    panelKicker: "Price watch",
    panelTitle: "Подборка товаров со старой ценой",
    panelDescription: "Запустите API, чтобы увидеть актуальные товары и скидки.",
    imageUrl: null,
    isActive: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
};

@Injectable()
export class HomeSliderService {
    constructor(private readonly prisma: PrismaService) {}

    async getPublicSlider() {
        const slider = await this.prisma.homeSlider.findFirst({
            orderBy: { updatedAt: "desc" },
        });

        if (!slider || !slider.isActive) {
            return defaultSlider;
        }

        return slider;
    }

    async getAdminSlider() {
        const slider = await this.prisma.homeSlider.findFirst({
            orderBy: { updatedAt: "desc" },
        });

        return slider ?? defaultSlider;
    }

    async update(dto: UpdateHomeSliderDto) {
        const current = await this.prisma.homeSlider.findFirst({
            select: { id: true },
            orderBy: { updatedAt: "desc" },
        });

        const data = {
            ...dto,
            primaryText: this.emptyToNull(dto.primaryText),
            primaryLabel: this.emptyToNull(dto.primaryLabel),
            secondaryText: this.emptyToNull(dto.secondaryText),
            secondaryLabel: this.emptyToNull(dto.secondaryLabel),
            imageUrl: this.emptyToNull(dto.imageUrl),
            isActive: dto.isActive ?? true,
        };

        if (current) {
            return this.prisma.homeSlider.update({
                where: { id: current.id },
                data,
            });
        }

        return this.prisma.homeSlider.create({ data });
    }

    private emptyToNull(value: string | undefined) {
        const trimmed = value?.trim();

        return trimmed ? trimmed : null;
    }
}
