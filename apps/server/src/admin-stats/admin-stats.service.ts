import { Injectable } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminStatsService {
    constructor(private readonly prisma: PrismaService) {}

    async getDashboard() {
        const [
            productCount,
            activeProductCount,
            orderCount,
            newOrderCount,
            userCount,
            blockedUserCount,
            brandCount,
            categoryCount,
            sales,
            ordersByStatus,
            latestOrders,
            lowStockProducts,
        ] = await this.prisma.$transaction([
            this.prisma.product.count(),
            this.prisma.product.count({ where: { isActive: true } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: OrderStatus.NEW } }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isBlocked: true } }),
            this.prisma.brand.count({ where: { isActive: true } }),
            this.prisma.category.count({ where: { isActive: true } }),
            this.prisma.order.aggregate({
                where: { status: { not: OrderStatus.CANCELLED } },
                _sum: { totalPrice: true },
            }),
            this.prisma.order.groupBy({
                by: ["status"],
                orderBy: { status: "asc" },
                _count: { _all: true },
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { id: true, email: true, name: true } },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    sku: true,
                                    images: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.product.findMany({
                where: {
                    isActive: true,
                    stock: { lte: 5 },
                },
                take: 10,
                orderBy: [{ stock: "asc" }, { title: "asc" }],
                include: {
                    brand: true,
                    category: true,
                },
            }),
        ]);

        const topProducts = await this.getTopProducts();

        return {
            products: {
                total: productCount,
                active: activeProductCount,
                inactive: productCount - activeProductCount,
                lowStock: lowStockProducts.length,
                lowStockItems: lowStockProducts,
            },
            orders: {
                total: orderCount,
                new: newOrderCount,
                byStatus: this.formatOrdersByStatus(ordersByStatus),
                latest: latestOrders,
            },
            users: {
                total: userCount,
                blocked: blockedUserCount,
            },
            catalog: {
                brands: brandCount,
                categories: categoryCount,
            },
            sales: {
                totalRevenue: Number(sales._sum.totalPrice ?? 0),
                topProducts,
            },
        };
    }

    private async getTopProducts() {
        const items = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    status: { not: OrderStatus.CANCELLED },
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        sku: true,
                        images: true,
                    },
                },
            },
        });

        const products = new Map<
            string,
            {
                product: {
                    id: string;
                    title: string;
                    sku: string;
                    images: string[];
                };
                totalQuantity: number;
                totalRevenue: number;
            }
        >();

        for (const item of items) {
            const current = products.get(item.productId) ?? {
                product: item.product,
                totalQuantity: 0,
                totalRevenue: 0,
            };

            current.totalQuantity += item.quantity;
            current.totalRevenue = Number((current.totalRevenue + Number(item.price) * item.quantity).toFixed(2));
            products.set(item.productId, current);
        }

        return [...products.values()]
            .sort((a, b) => b.totalQuantity - a.totalQuantity || b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
    }

    private formatOrdersByStatus(items: Array<{ status: OrderStatus; _count?: true | { _all?: number } }>) {
        const base = Object.fromEntries(Object.values(OrderStatus).map((status) => [status, 0]));

        for (const item of items) {
            base[item.status] = typeof item._count === "object" ? (item._count._all ?? 0) : 0;
        }

        return base;
    }
}
