import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { OrderStatus, PrismaClient, Role, SpecValueType } from "@prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: "admin@techmarket.local",
    password: "Admin12345",
    name: "TechMarket Admin",
    role: Role.ADMIN,
  },
  {
    email: "user@techmarket.local",
    password: "User12345",
    name: "TechMarket User",
    role: Role.USER,
  },
];

const categories = [
  ["Ноутбуки и компьютеры", "laptops-computers", "Ноутбуки, ПК, моноблоки и компьютерные системы"],
  ["Комплектующие", "components", "Процессоры, видеокарты, память, SSD и другие компоненты"],
  ["Периферия", "peripherals", "Клавиатуры, мыши, мониторы, гарнитуры и устройства ввода"],
  ["Телефоны и smart-часы", "phones-smartwatch", "Смартфоны, умные часы и мобильные аксессуары"],
  ["Бытовая техника", "home-appliances", "Техника для кухни, уборки и ухода за домом"],
  ["ТВ и аудио", "tv-audio", "Телевизоры, колонки, саундбары и аудиосистемы"],
  ["Gaming", "gaming", "Игровые устройства, консоли и аксессуары"],
  ["Умный дом", "smart-home", "Датчики, камеры, лампы и устройства автоматизации"],
  ["Фото и видео", "photo-video", "Камеры, объективы, видеотехника и аксессуары"],
  ["Аксессуары", "accessories", "Кабели, зарядные устройства, чехлы и полезные дополнения"],
];

const brands = [
  ["Apple", "apple", "Производитель компьютеров, смартфонов и персональной электроники"],
  ["Lenovo", "lenovo", "Производитель ноутбуков, ПК и компьютерной техники"],
  ["HP", "hp", "Производитель ноутбуков, ПК, принтеров и периферии"],
  ["Samsung", "samsung", "Производитель смартфонов, телевизоров и бытовой техники"],
  ["LG", "lg", "Производитель телевизоров, аудио и бытовой техники"],
  ["Bosch", "bosch", "Производитель бытовой техники для дома и кухни"],
  ["Sony", "sony", "Производитель аудио, видео, фото и gaming-устройств"],
  ["Xiaomi", "xiaomi", "Производитель смартфонов, умных устройств и аксессуаров"],
];

const specTemplates = {
  "laptops-computers": [
    ["screenSize", "Диагональ экрана", SpecValueType.NUMBER, "дюйм", true, true, 10],
    ["processor", "Процессор", SpecValueType.STRING, null, true, true, 20],
    ["ram", "Оперативная память", SpecValueType.NUMBER, "GB", true, true, 30],
    ["ssd", "Объем SSD", SpecValueType.NUMBER, "GB", true, true, 40],
    ["os", "Операционная система", SpecValueType.STRING, null, false, true, 50],
  ],
  "phones-smartwatch": [
    ["screenSize", "Диагональ экрана", SpecValueType.NUMBER, "дюйм", true, true, 10],
    ["memory", "Встроенная память", SpecValueType.NUMBER, "GB", true, true, 20],
    ["camera", "Основная камера", SpecValueType.NUMBER, "MP", false, true, 30],
    ["nfc", "NFC", SpecValueType.BOOLEAN, null, false, true, 40],
  ],
  "home-appliances": [
    ["deviceType", "Тип устройства", SpecValueType.STRING, null, true, true, 10],
    ["energyClass", "Класс энергопотребления", SpecValueType.STRING, null, false, true, 20],
    ["capacity", "Вместимость", SpecValueType.NUMBER, "л", false, true, 30],
    ["color", "Цвет", SpecValueType.STRING, null, false, true, 40],
  ],
  "tv-audio": [
    ["screenSize", "Диагональ экрана", SpecValueType.NUMBER, "дюйм", true, true, 10],
    ["resolution", "Разрешение", SpecValueType.STRING, null, true, true, 20],
    ["smartTv", "Smart TV", SpecValueType.BOOLEAN, null, false, true, 30],
    ["power", "Мощность звука", SpecValueType.NUMBER, "Вт", false, true, 40],
  ],
};

const products = [
  {
    title: "Lenovo IdeaPad 5 16",
    slug: "lenovo-ideapad-5-16",
    sku: "NB-LEN-0001",
    description: "Ноутбук для учебы, работы и мультимедиа с большим экраном и быстрым SSD.",
    price: 2599.99,
    oldPrice: 2899.99,
    categorySlug: "laptops-computers",
    brandSlug: "lenovo",
    stock: 12,
    images: ["/uploads/products/lenovo-ideapad-5-16.jpg"],
    specs: { screenSize: 16, processor: "Intel Core i5", ram: 16, ssd: 512, os: "Windows 11" },
  },
  {
    title: "Apple MacBook Air 13 M3",
    slug: "apple-macbook-air-13-m3",
    sku: "NB-APL-0001",
    description: "Легкий ноутбук Apple для учебы, работы и мобильного использования.",
    price: 4399.99,
    categorySlug: "laptops-computers",
    brandSlug: "apple",
    stock: 7,
    images: ["/uploads/products/apple-macbook-air-13-m3.jpg"],
    specs: { screenSize: 13.6, processor: "Apple M3", ram: 16, ssd: 512, os: "macOS" },
  },
  {
    title: "HP Pavilion 15",
    slug: "hp-pavilion-15",
    sku: "NB-HP-0001",
    description: "Универсальный ноутбук HP для дома, офиса и повседневной работы.",
    price: 2199.99,
    categorySlug: "laptops-computers",
    brandSlug: "hp",
    stock: 15,
    images: ["/uploads/products/hp-pavilion-15.jpg"],
    specs: { screenSize: 15.6, processor: "AMD Ryzen 5", ram: 16, ssd: 512, os: "Windows 11" },
  },
  {
    title: "Samsung Galaxy S25",
    slug: "samsung-galaxy-s25",
    sku: "PH-SAM-0001",
    description: "Смартфон Samsung с ярким экраном, производительным процессором и NFC.",
    price: 3299.99,
    oldPrice: 3499.99,
    categorySlug: "phones-smartwatch",
    brandSlug: "samsung",
    stock: 18,
    images: ["/uploads/products/samsung-galaxy-s25.jpg"],
    specs: { screenSize: 6.2, memory: 256, camera: 50, nfc: true },
  },
  {
    title: "Xiaomi Redmi Note 14",
    slug: "xiaomi-redmi-note-14",
    sku: "PH-XIA-0001",
    description: "Смартфон Xiaomi с хорошей автономностью и большим объемом памяти.",
    price: 1099.99,
    categorySlug: "phones-smartwatch",
    brandSlug: "xiaomi",
    stock: 24,
    images: ["/uploads/products/xiaomi-redmi-note-14.jpg"],
    specs: { screenSize: 6.67, memory: 128, camera: 108, nfc: true },
  },
  {
    title: "Bosch Serie 4 Refrigerator",
    slug: "bosch-serie-4-refrigerator",
    sku: "HA-BOS-0001",
    description: "Холодильник Bosch с вместительной камерой и экономичным энергопотреблением.",
    price: 2799.99,
    categorySlug: "home-appliances",
    brandSlug: "bosch",
    stock: 6,
    images: ["/uploads/products/bosch-serie-4-refrigerator.jpg"],
    specs: { deviceType: "Холодильник", energyClass: "A++", capacity: 324, color: "White" },
  },
  {
    title: "LG Washing Machine F2",
    slug: "lg-washing-machine-f2",
    sku: "HA-LG-0001",
    description: "Стиральная машина LG с оптимальным набором программ для семьи.",
    price: 1899.99,
    categorySlug: "home-appliances",
    brandSlug: "lg",
    stock: 9,
    images: ["/uploads/products/lg-washing-machine-f2.jpg"],
    specs: { deviceType: "Стиральная машина", energyClass: "A+++", capacity: 8, color: "White" },
  },
  {
    title: "Samsung QLED 55 Smart TV",
    slug: "samsung-qled-55-smart-tv",
    sku: "TV-SAM-0001",
    description: "Телевизор Samsung QLED с поддержкой Smart TV и высоким разрешением.",
    price: 2999.99,
    categorySlug: "tv-audio",
    brandSlug: "samsung",
    stock: 11,
    images: ["/uploads/products/samsung-qled-55-smart-tv.jpg"],
    specs: { screenSize: 55, resolution: "4K UHD", smartTv: true, power: 40 },
  },
  {
    title: "Sony Bravia 65 OLED",
    slug: "sony-bravia-65-oled",
    sku: "TV-SON-0001",
    description: "OLED-телевизор Sony с глубоким черным цветом и качественным звуком.",
    price: 5899.99,
    categorySlug: "tv-audio",
    brandSlug: "sony",
    stock: 4,
    images: ["/uploads/products/sony-bravia-65-oled.jpg"],
    specs: { screenSize: 65, resolution: "4K UHD", smartTv: true, power: 60 },
  },
];

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        isBlocked: false,
      },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });
  }

  for (const [index, [name, slug, description]] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        description,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        name,
        slug,
        description,
        sortOrder: index + 1,
      },
    });
  }

  for (const [name, slug, description] of brands) {
    await prisma.brand.upsert({
      where: { slug },
      update: {
        name,
        description,
        isActive: true,
      },
      create: {
        name,
        slug,
        description,
      },
    });
  }

  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.slug, category]),
  );
  const brandBySlug = Object.fromEntries((await prisma.brand.findMany()).map((brand) => [brand.slug, brand]));

  for (const [categorySlug, templates] of Object.entries(specTemplates)) {
    const category = categoryBySlug[categorySlug];

    for (const [key, label, type, unit, isRequired, isComparable, sortOrder] of templates) {
      await prisma.categorySpecTemplate.upsert({
        where: { categoryId_key: { categoryId: category.id, key } },
        update: {
          label,
          type,
          unit,
          isRequired,
          isComparable,
          sortOrder,
        },
        create: {
          categoryId: category.id,
          key,
          label,
          type,
          unit,
          isRequired,
          isComparable,
          sortOrder,
        },
      });
    }
  }

  for (const product of products) {
    const category = categoryBySlug[product.categorySlug];
    const brand = brandBySlug[product.brandSlug];

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        isActive: true,
        categoryId: category.id,
        brandId: brand.id,
      },
      create: {
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        categoryId: category.id,
        brandId: brand.id,
      },
    });
  }

  const demoUser = await prisma.user.findUnique({
    where: { email: "user@techmarket.local" },
  });
  const demoAdmin = await prisma.user.findUnique({
    where: { email: "admin@techmarket.local" },
  });
  const productBySku = Object.fromEntries((await prisma.product.findMany()).map((product) => [product.sku, product]));

  if (demoUser) {
    await prisma.address.deleteMany({
      where: {
        userId: demoUser.id,
        label: { startsWith: "Seed" },
      },
    });

    await prisma.address.createMany({
      data: [
        {
          userId: demoUser.id,
          label: "Seed home",
          city: "Минск",
          street: "ул. Ленина",
          house: "10",
          apartment: "15",
          zipCode: "220030",
          isDefault: true,
        },
        {
          userId: demoUser.id,
          label: "Seed pickup",
          city: "Минск",
          street: "пр-т Победителей",
          house: "25",
          zipCode: "220004",
        },
      ],
    });

    await prisma.order.deleteMany({
      where: {
        userId: demoUser.id,
        comment: { startsWith: "Seed demo order" },
      },
    });

    const demoOrders = [
      {
        status: OrderStatus.CONFIRMED,
        items: [
          { sku: "NB-LEN-0001", quantity: 1 },
          { sku: "PH-XIA-0001", quantity: 1 },
        ],
        customerName: "TechMarket User",
        customerPhone: "+375291112233",
        customerEmail: "user@techmarket.local",
        city: "Минск",
        deliveryAddress: "ул. Ленина, 10-15",
        deliveryMethod: "courier",
        paymentMethod: "cash_on_delivery",
        comment: "Seed demo order: confirmed",
      },
      {
        status: OrderStatus.PROCESSING,
        items: [{ sku: "TV-SAM-0001", quantity: 1 }],
        customerName: "TechMarket User",
        customerPhone: "+375291112233",
        customerEmail: "user@techmarket.local",
        city: "Минск",
        deliveryAddress: "пр-т Победителей, 25",
        deliveryMethod: "pickup_point",
        paymentMethod: "card_mock",
        comment: "Seed demo order: processing",
      },
    ];

    for (const demoOrder of demoOrders) {
      const totalPrice = demoOrder.items.reduce((sum, item) => {
        const product = productBySku[item.sku];
        return sum + Number(product.price) * item.quantity;
      }, 0);

      await prisma.order.create({
        data: {
          userId: demoUser.id,
          status: demoOrder.status,
          totalPrice,
          customerName: demoOrder.customerName,
          customerPhone: demoOrder.customerPhone,
          customerEmail: demoOrder.customerEmail,
          city: demoOrder.city,
          deliveryAddress: demoOrder.deliveryAddress,
          deliveryMethod: demoOrder.deliveryMethod,
          paymentMethod: demoOrder.paymentMethod,
          comment: demoOrder.comment,
          items: {
            create: demoOrder.items.map((item) => {
              const product = productBySku[item.sku];

              return {
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
      });
    }
  }

  const reviewAuthors = [demoUser, demoAdmin].filter(Boolean);

  if (reviewAuthors.length) {
    for (const author of reviewAuthors) {
      await prisma.review.deleteMany({
        where: {
          userId: author.id,
          comment: { startsWith: "Seed demo review" },
        },
      });
    }

    const demoReviews = [
      { user: demoUser, sku: "NB-LEN-0001", rating: 5, comment: "Seed demo review: хороший ноутбук для учебы и работы." },
      { user: demoAdmin, sku: "NB-LEN-0001", rating: 4, comment: "Seed demo review: сбалансированная модель с нормальным запасом мощности." },
      { user: demoUser, sku: "PH-XIA-0001", rating: 5, comment: "Seed demo review: отличное соотношение цены и возможностей." },
      { user: demoAdmin, sku: "TV-SAM-0001", rating: 4, comment: "Seed demo review: яркая картинка и удобный Smart TV." },
    ];

    for (const review of demoReviews) {
      if (!review.user || !productBySku[review.sku]) {
        continue;
      }

      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: review.user.id,
            productId: productBySku[review.sku].id,
          },
        },
        update: {
          rating: review.rating,
          comment: review.comment,
          isActive: true,
        },
        create: {
          userId: review.user.id,
          productId: productBySku[review.sku].id,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
