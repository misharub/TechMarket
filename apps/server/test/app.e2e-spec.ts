import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { OrderStatus } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/bootstrap";
import { PrismaService } from "../src/prisma/prisma.service";
import { configureTestEnv, ensureTestDatabaseExists, resetAndSeedTestDatabase } from "./helpers/e2e-db";

describe("TechMarket API e2e", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let server: Parameters<typeof request>[0];

    beforeAll(async () => {
        configureTestEnv();
        await ensureTestDatabaseExists();
        resetAndSeedTestDatabase();

        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        configureApp(app);
        await app.init();

        prisma = app.get(PrismaService);
        server = app.getHttpServer();
        serverRef.current = server;
    });

    afterAll(async () => {
        await app?.close();
    });

    it("checks health endpoint", async () => {
        const response = await request(server).get("/api/health").expect(200);

        expect(response.body).toEqual({
            status: "ok",
            service: "TechMarket API",
        });
    });

    it("handles auth login, me, refresh, logout and OAuth configuration errors", async () => {
        const agent = request.agent(server);
        const loginResponse = await agent
            .post("/api/auth/login")
            .send({ email: "user@techmarket.local", password: "User12345" })
            .expect(201);

        expect(loginResponse.body.accessToken).toEqual(expect.any(String));
        expect(loginResponse.body.user.email).toBe("user@techmarket.local");

        await request(server)
            .get("/api/auth/me")
            .set(authHeader(loginResponse.body.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.email).toBe("user@techmarket.local");
            });

        await agent
            .post("/api/auth/refresh")
            .expect(201)
            .expect(({ body }) => {
                expect(body.accessToken).toEqual(expect.any(String));
            });

        await agent.post("/api/auth/logout").expect(201).expect({ success: true });

        const email = `e2e-${Date.now()}@techmarket.local`;
        await request(server)
            .post("/api/auth/register")
            .send({ name: "E2E User", email, password: "Password123" })
            .expect(201)
            .expect(({ body }) => {
                expect(body.user.email).toBe(email);
            });

        await request(server).get("/api/auth/google").expect(503);
        await request(server).get("/api/auth/google/callback?code=fake-code").expect(400);
        await request(server).get("/api/auth/vk").expect(503);
    });

    it("protects admin endpoints by token and role", async () => {
        const user = await login("user@techmarket.local", "User12345");
        const admin = await login("admin@techmarket.local", "Admin12345");
        const brandPayload = {
            name: "E2E Brand",
            slug: `e2e-brand-${Date.now()}`,
            description: "Brand created by e2e test",
        };

        await request(server).post("/api/brands").send(brandPayload).expect(401);
        await request(server).post("/api/brands").set(authHeader(user.accessToken)).send(brandPayload).expect(403);

        await request(server)
            .post("/api/brands")
            .set(authHeader(admin.accessToken))
            .send(brandPayload)
            .expect(201)
            .expect(({ body }) => {
                expect(body.slug).toBe(brandPayload.slug);
            });
    });

    it("serves and manages delivery and payment checkout options", async () => {
        const admin = await login("admin@techmarket.local", "Admin12345");

        await request(server)
            .get("/api/delivery-methods")
            .expect(200)
            .expect(({ body }) => {
                expect(body.some((method: { code: string }) => method.code === "courier")).toBe(true);
            });

        await request(server)
            .get("/api/payment-methods")
            .expect(200)
            .expect(({ body }) => {
                expect(body.some((method: { code: string }) => method.code === "cash_on_delivery")).toBe(true);
            });

        await request(server).post("/api/admin/delivery-methods").send({ code: "e2e_delivery", name: "E2E Delivery" }).expect(401);

        await request(server)
            .post("/api/admin/delivery-methods")
            .set(authHeader(admin.accessToken))
            .send({ code: "e2e_delivery", name: "E2E Delivery", price: 5, sortOrder: 99 })
            .expect(201)
            .expect(({ body }) => {
                expect(body.code).toBe("e2e_delivery");
            });

        await request(server)
            .post("/api/admin/payment-methods")
            .set(authHeader(admin.accessToken))
            .send({ code: "e2e_payment", name: "E2E Payment", sortOrder: 99 })
            .expect(201)
            .expect(({ body }) => {
                expect(body.code).toBe("e2e_payment");
            });
    });

    it("returns catalog products with pagination, search and slug lookup", async () => {
        const listResponse = await request(server).get("/api/products?limit=2&page=1").expect(200);

        expect(listResponse.body.items).toHaveLength(2);
        expect(listResponse.body.total).toBeGreaterThanOrEqual(2);
        expect(listResponse.body.pages).toBeGreaterThanOrEqual(1);

        const searchResponse = await request(server).get("/api/products?search=Lenovo&limit=10").expect(200);
        expect(searchResponse.body.items.some((product: { title: string }) => product.title.includes("Lenovo"))).toBe(true);

        const product = searchResponse.body.items[0];
        await request(server)
            .get(`/api/products/by-slug/${product.slug}`)
            .expect(200)
            .expect(({ body }) => {
                expect(body.id).toBe(product.id);
            });
    });

    it("supports cart, promo validation, checkout, stock decrement and notifications", async () => {
        const user = await login("user@techmarket.local", "User12345");
        const admin = await login("admin@techmarket.local", "Admin12345");
        const product = await prisma.product.findFirstOrThrow({
            where: { isActive: true, stock: { gt: 0 }, title: { contains: "Lenovo" } },
        });
        const stockBefore = product.stock;

        await request(server).delete("/api/cart").set(authHeader(user.accessToken)).expect(200);

        const cartItemResponse = await request(server)
            .post("/api/cart")
            .set(authHeader(user.accessToken))
            .send({ productId: product.id, quantity: 1 })
            .expect(201);

        await request(server)
            .patch(`/api/cart/${cartItemResponse.body.id}`)
            .set(authHeader(user.accessToken))
            .send({ quantity: 1 })
            .expect(200);

        await request(server)
            .post("/api/promo-codes/validate")
            .set(authHeader(user.accessToken))
            .send({ code: "WELCOME10" })
            .expect(201)
            .expect(({ body }) => {
                expect(Number(body.discountAmount)).toBeGreaterThan(0);
            });

        const orderResponse = await request(server)
            .post("/api/orders")
            .set(authHeader(user.accessToken))
            .send({
                customerName: "TechMarket User",
                customerPhone: "+375291112233",
                customerEmail: "user@techmarket.local",
                city: "Minsk",
                deliveryAddress: "E2E test address",
                deliveryMethod: "courier",
                paymentMethod: "cash_on_delivery",
                promoCode: "WELCOME10",
                comment: "E2E checkout order",
            })
            .expect(201);

        expect(Number(orderResponse.body.discountAmount)).toBeGreaterThan(0);
        expect(orderResponse.body.promoCodeCode).toBe("WELCOME10");
        expect(orderResponse.body.orderNumber).toMatch(/^TM-\d{4}-\d{6}$/);
        expect(orderResponse.body.statusHistory).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    toStatus: OrderStatus.NEW,
                }),
            ]),
        );
        expect(Number(orderResponse.body.deliveryPrice)).toBeGreaterThan(0);
        expect(orderResponse.body.deliveryMethodName).toEqual(expect.any(String));
        expect(orderResponse.body.paymentMethodName).toEqual(expect.any(String));

        await request(server)
            .get("/api/cart")
            .set(authHeader(user.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.items).toHaveLength(0);
            });

        const productAfter = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
        expect(productAfter.stock).toBe(stockBefore - 1);

        await request(server)
            .get("/api/notifications")
            .set(authHeader(user.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.unreadCount).toBeGreaterThan(0);
                expect(
                    body.items.some(
                        (notification: { type: string; message: string }) =>
                            notification.type === "ORDER_CREATED" && notification.message.includes(orderResponse.body.orderNumber),
                    ),
                ).toBe(true);
            });

        await request(server)
            .patch(`/api/admin/orders/${orderResponse.body.id}/status`)
            .set(authHeader(admin.accessToken))
            .send({ status: OrderStatus.PROCESSING, adminComment: "E2E admin status note" })
            .expect(200)
            .expect(({ body }) => {
                expect(body.status).toBe(OrderStatus.PROCESSING);
                expect(body.adminComment).toBe("E2E admin status note");
                expect(body.statusHistory).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            fromStatus: OrderStatus.NEW,
                            toStatus: OrderStatus.PROCESSING,
                            adminComment: "E2E admin status note",
                        }),
                    ]),
                );
            });

        const notificationsResponse = await request(server).get("/api/notifications").set(authHeader(user.accessToken)).expect(200);
        const createdNotification = notificationsResponse.body.items.find(
            (notification: { type: string; message: string }) =>
                notification.type === "ORDER_STATUS_CHANGED" && notification.message.includes(orderResponse.body.orderNumber),
        );
        expect(createdNotification).toBeDefined();

        await request(server)
            .patch(`/api/notifications/${createdNotification.id}/read`)
            .set(authHeader(user.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.isRead).toBe(true);
                expect(body.readAt).toEqual(expect.any(String));
            });

        await request(server)
            .patch(`/api/notifications/${createdNotification.id}/read`)
            .set(authHeader(admin.accessToken))
            .expect(404);

        await request(server)
            .patch("/api/notifications/read-all")
            .set(authHeader(user.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.updated).toBeGreaterThanOrEqual(0);
            });

        await request(server)
            .patch(`/api/admin/orders/${orderResponse.body.id}/status`)
            .set(authHeader(admin.accessToken))
            .send({ status: OrderStatus.CANCELLED, adminComment: "E2E cancellation" })
            .expect(200)
            .expect(({ body }) => {
                expect(body.status).toBe(OrderStatus.CANCELLED);
            });

        const productAfterCancel = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
        expect(productAfterCancel.stock).toBe(stockBefore);

        await request(server)
            .patch(`/api/admin/orders/${orderResponse.body.id}/status`)
            .set(authHeader(admin.accessToken))
            .send({ status: OrderStatus.CONFIRMED })
            .expect(400);
    });

    it("keeps unselected cart items after checkout and supports pickup delivery", async () => {
        const user = await login("user@techmarket.local", "User12345");
        const products = await prisma.product.findMany({
            where: { isActive: true, stock: { gt: 1 } },
            orderBy: { title: "asc" },
            take: 2,
        });

        expect(products).toHaveLength(2);

        await request(server).delete("/api/cart").set(authHeader(user.accessToken)).expect(200);

        const selectedItem = await request(server)
            .post("/api/cart")
            .set(authHeader(user.accessToken))
            .send({ productId: products[0].id, quantity: 1 })
            .expect(201);
        const unselectedItem = await request(server)
            .post("/api/cart")
            .set(authHeader(user.accessToken))
            .send({ productId: products[1].id, quantity: 1 })
            .expect(201);

        await request(server)
            .patch(`/api/cart/${unselectedItem.body.id}`)
            .set(authHeader(user.accessToken))
            .send({ quantity: 1, isSelected: false })
            .expect(200);

        const pickupPointsResponse = await request(server).get("/api/pickup-points?scenario=STORE_PICKUP").expect(200);
        expect(pickupPointsResponse.body.length).toBeGreaterThan(0);

        await request(server)
            .post("/api/orders")
            .set(authHeader(user.accessToken))
            .send({
                customerName: "TechMarket User",
                customerPhone: "+375291112233",
                customerEmail: "user@techmarket.local",
                deliveryMethod: "pickup",
                pickupPointId: pickupPointsResponse.body[0].id,
                paymentMethod: "cash_on_delivery",
            })
            .expect(201)
            .expect(({ body }) => {
                expect(body.items).toHaveLength(1);
                expect(body.items[0].productId).toBe(products[0].id);
                expect(body.pickupPointName).toBe(pickupPointsResponse.body[0].name);
            });

        await request(server)
            .get("/api/cart")
            .set(authHeader(user.accessToken))
            .expect(200)
            .expect(({ body }) => {
                expect(body.items).toHaveLength(1);
                expect(body.items[0].id).toBe(unselectedItem.body.id);
                expect(body.items[0].isSelected).toBe(false);
            });

        expect(selectedItem.body.id).toEqual(expect.any(String));
    });

    it("compares products only inside one category", async () => {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { title: "asc" },
        });
        const sameCategoryProducts = products.filter((product) => product.categoryId === products[0].categoryId).slice(0, 2);
        const differentCategoryProduct = products.find((product) => product.categoryId !== sameCategoryProducts[0].categoryId);

        expect(sameCategoryProducts).toHaveLength(2);
        expect(differentCategoryProduct).toBeDefined();

        await request(server)
            .post("/api/products/compare")
            .send({ productIds: sameCategoryProducts.map((product) => product.id) })
            .expect(201)
            .expect(({ body }) => {
                expect(body.products).toHaveLength(2);
                expect(body.rows.length).toBeGreaterThan(0);
                expect(body.aiSummary).toEqual(expect.any(String));
            });

        await request(server)
            .post("/api/products/compare")
            .send({ productIds: [sameCategoryProducts[0].id, differentCategoryProduct!.id] })
            .expect(400);

        await request(server).post("/api/products/compare").send({ productIds: [sameCategoryProducts[0].id] }).expect(400);
    });

    it("exports products/orders and imports products from CSV", async () => {
        const admin = await login("admin@techmarket.local", "Admin12345");
        const category = await prisma.category.findUniqueOrThrow({ where: { slug: "laptops-computers" } });
        const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: "lenovo" } });
        const sku = `E2E-CSV-${Date.now()}`;
        const slug = `e2e-csv-${Date.now()}`;
        const csv = [
            "title,slug,sku,description,price,oldPrice,stock,categorySlug,brandSlug,images,specsJson,isActive",
            [
                "E2E CSV Laptop",
                slug,
                sku,
                "Imported product from e2e CSV",
                "1999.99",
                "",
                "3",
                category.slug,
                brand.slug,
                "/uploads/products/e2e.csv.jpg",
                JSON.stringify({ screenSize: 15.6, processor: "Intel Core i5", ram: 16, ssd: 512, os: "Windows 11" }).replace(/"/g, '""'),
                "true",
            ].map((value) => `"${value}"`).join(","),
        ].join("\r\n");

        await request(server)
            .get("/api/admin/export/products")
            .set(authHeader(admin.accessToken))
            .expect(200)
            .expect("Content-Type", /text\/csv/)
            .expect(({ text }) => {
                expect(text).toContain("sku");
            });

        await request(server)
            .get("/api/admin/export/orders")
            .set(authHeader(admin.accessToken))
            .expect(200)
            .expect("Content-Type", /text\/csv/)
            .expect(({ text }) => {
                expect(text).toContain("totalPrice");
            });

        await request(server)
            .post("/api/admin/import/products")
            .set(authHeader(admin.accessToken))
            .attach("file", Buffer.from(csv, "utf8"), { filename: "products.csv", contentType: "text/csv" })
            .expect(201)
            .expect(({ body }) => {
                expect(body.created).toBe(1);
                expect(body.errors).toHaveLength(0);
            });

        await expect(prisma.product.findUnique({ where: { sku } })).resolves.toMatchObject({
            title: "E2E CSV Laptop",
            slug,
            categoryId: category.id,
            brandId: brand.id,
        });
    });
});

async function login(email: string, password: string) {
    const response = await request(serverRef.current)
        .post("/api/auth/login")
        .send({ email, password })
        .expect(201);

    return {
        accessToken: response.body.accessToken as string,
        user: response.body.user,
    };
}

function authHeader(accessToken: string) {
    return { Authorization: `Bearer ${accessToken}` };
}

const serverRef: { current: Parameters<typeof request>[0] } = {
    current: undefined as unknown as Parameters<typeof request>[0],
};
