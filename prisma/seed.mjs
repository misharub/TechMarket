import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { DiscountType, NotificationType, OrderStatus, PrismaClient, Role, SpecValueType } from "@prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: "admin@techmarket.local",
    password: "Admin12345",
    firstName: "TechMarket",
    lastName: "Admin",
    role: Role.ADMIN,
  },
  {
    email: "user@techmarket.local",
    password: "User12345",
    firstName: "TechMarket",
    lastName: "User",
    role: Role.USER,
  },
];

const categories = [
  {
    name: "Ноутбуки и компьютеры",
    slug: "laptops-computers",
    description: "Ноутбуки, ПК, моноблоки, планшеты и электронные книги",
    children: [
      {
        name: "Ноутбуки",
        slug: "notebooks",
        description: "Ноутбуки для дома, учебы, бизнеса и игр",
      },
      {
        name: "Аксессуары для ноутбуков",
        slug: "laptop-accessories",
        children: [
          ["Внешние диски", "external-drives"],
          ["Сумки для ноутбуков", "laptop-bags"],
          ["Рюкзаки для ноутбуков", "laptop-backpacks"],
          ["Охлаждающие подставки", "laptop-cooling-stands"],
          ["Док-станции", "docking-stations"],
        ],
      },
      {
        name: "Компьютеры",
        slug: "desktop-computers",
        description: "Готовые компьютеры и компактные рабочие станции",
        children: [
          ["Игровые ПК", "gaming-pcs"],
          ["Компьютеры для офиса", "office-pcs"],
          ["Моноблоки", "all-in-one-pcs"],
          ["Мини-ПК", "mini-pcs"],
        ],
      },
      {
        name: "Серверы и компоненты",
        slug: "servers-components",
        children: [
          ["Серверы", "servers"],
          ["Серверные диски", "server-drives"],
          ["Серверная память", "server-memory"],
          ["Сетевые карты", "network-cards"],
          ["ИБП для серверов", "server-ups"],
        ],
      },
      {
        name: "Планшеты",
        slug: "tablets",
        children: [
          ["Apple iPad", "apple-ipad"],
          ["Планшеты Samsung", "samsung-tablets"],
          ["Планшеты Lenovo", "lenovo-tablets"],
          ["Планшеты Xiaomi", "xiaomi-tablets"],
          ["Графические планшеты", "graphics-tablets"],
          ["Аксессуары для планшетов", "tablet-computer-accessories"],
        ],
      },
      {
        name: "Электронные книги",
        slug: "e-readers",
        children: [
          ["Электронные книги Kindle", "kindle-e-readers"],
          ["Электронные книги PocketBook", "pocketbook-e-readers"],
          ["Электронные книги с подсветкой", "backlit-e-readers"],
          ["Чехлы для электронных книг", "e-reader-cases"],
          ["Аксессуары для электронных книг", "e-reader-accessories"],
        ],
      },
    ],
  },
  {
    name: "Аксессуары",
    slug: "accessories",
    description: "Кабели, зарядные устройства, чехлы и полезные дополнения",
    children: [
      {
        name: "Кабели и питание",
        slug: "cables-power",
        children: [
          ["Кабели USB-C", "usb-c-cables"],
          ["HDMI кабели", "accessory-hdmi-cables"],
          ["Сетевые фильтры", "power-strips"],
          ["Зарядные устройства", "chargers"],
          ["Адаптеры и переходники", "adapters"],
        ],
      },
      {
        name: "Расходные материалы",
        slug: "consumables",
        children: [
          ["Картриджи", "printer-cartridges"],
          ["Тонеры", "printer-toners"],
          ["Бумага для печати", "printer-paper"],
          ["Чистящие средства", "cleaning-care"],
        ],
      },
    ],
  },
  {
    name: "Телефоны и умные часы",
    slug: "phones-smartwatch",
    description: "Смартфоны, умные часы и мобильные аксессуары",
    children: [
      {
        name: "Телефоны и смартфоны",
        slug: "smartphones",
      },
      {
        name: "Смарт-часы и браслеты",
        slug: "smartwatches",
        children: [
          ["Спортивные часы", "sport-watches"],
          ["Фитнес-браслеты", "fitness-bands"],
          ["Ремешки для часов", "smartwatch-straps"],
          ["Защита smartwatch", "smartwatch-protection"],
          ["Аксессуары для часов", "watch-accessories"],
        ],
      },
      {
        name: "Аксессуары для телефонов и часов",
        slug: "phone-accessories",
        children: [
          ["Наушники для телефона", "phone-headphones"],
          ["Power Bank", "powerbanks"],
          ["Чехлы для телефонов", "phone-cases"],
          ["Защита экрана", "phone-screen-protectors"],
          ["Держатели для телефона", "phone-holders"],
        ],
      },
      ["Стационарные телефоны", "landline-phones"],
    ],
  },
  {
    name: "Бытовая техника",
    slug: "home-appliances",
    description: "Техника для кухни, уборки и ухода за домом",
    children: [
      {
        name: "Техника для кухни",
        slug: "kitchen-appliances",
        children: [
          ["Холодильники", "refrigerators"],
          ["Посудомоечные машины", "dishwashers"],
          ["Микроволновые печи", "microwaves"],
          ["Блендеры", "blenders"],
          ["Электрочайники", "electric-kettles"],
          ["Аэрогрили и фритюрницы", "air-fryers"],
        ],
      },
      {
        name: "Техника для дома",
        slug: "home-care-appliances",
        children: [
          ["Стиральные машины", "washing-machines"],
          ["Сушильные машины", "dryers"],
          ["Пылесосы", "vacuum-cleaners"],
          ["Роботы-пылесосы", "robot-vacuums"],
          ["Утюги", "irons"],
        ],
      },
      {
        name: "Уход и гигиена",
        slug: "personal-care",
        children: [
          ["Фены", "hair-dryers"],
          ["Электробритвы", "electric-shavers"],
          ["Триммеры", "trimmers"],
          ["Электрические зубные щетки", "electric-toothbrushes"],
          ["Весы", "bathroom-scales"],
        ],
      },
      {
        name: "Кофе",
        slug: "coffee-equipment",
        children: [
          ["Кофемашины", "coffee-machines"],
          ["Капсульные кофеварки", "capsule-coffee-machines"],
          ["Кофемолки", "coffee-grinders"],
          ["Вспениватели молока", "milk-frothers"],
        ],
      },
      {
        name: "Аксессуары для бытовой техники",
        slug: "appliance-accessories",
        children: [
          ["Фильтры для воды", "water-filters"],
          ["Аксессуары для пылесосов", "vacuum-accessories"],
          ["Средства ухода", "appliance-care"],
          ["Запчасти и расходники", "appliance-consumables"],
        ],
      },
    ],
  },
  {
    name: "Телевизоры",
    slug: "tv-audio",
    description: "Телевизоры, Smart TV, саундбары и аксессуары",
    children: [
      {
        name: "Телевизоры",
        slug: "tvs",
        children: [
          ["Недорогие телевизоры", "budget-tvs"],
          ["Телевизоры 4K Ultra HD", "4k-tvs"],
          ["OLED телевизоры", "oled-tvs"],
          ["QLED телевизоры", "qled-tvs"],
          ["Телевизоры Smart TV", "smart-tv"],
        ],
      },
      {
        name: "Проекторы и экраны",
        slug: "projectors-screens",
        children: [
          ["Проекторы", "projectors"],
          ["Экраны для проекторов", "projector-screens"],
          ["Крепления для проекторов", "projector-mounts"],
          ["Аксессуары для проекторов", "projector-accessories"],
        ],
      },
      {
        name: "Аудио",
        slug: "audio",
        children: [
          ["Саундбары", "soundbars"],
          ["Колонки", "speakers"],
          ["Микрофоны", "microphones"],
          ["Домашние кинотеатры", "home-cinema"],
        ],
      },
      {
        name: "Аксессуары RTV",
        slug: "rtv-accessories",
        children: [
          ["HDMI кабели", "hdmi-cables"],
          ["Пульты для ТВ", "tv-remotes"],
          ["Крепления для ТВ", "tv-mounts"],
          ["Приставки Smart TV", "smart-tv-boxes"],
        ],
      },
    ],
  },
  {
    name: "Умный дом",
    slug: "smart-home",
    description: "Камеры, датчики, освещение и устройства автоматизации",
    children: [
      {
        name: "Умный дом",
        slug: "intelligent-home",
        children: [
          ["Камеры видеонаблюдения", "security-cameras"],
          ["Умное освещение", "smart-lighting"],
          ["Видеодомофоны", "video-doorbells"],
          ["Голосовые ассистенты", "voice-assistants"],
          ["Датчики", "sensors"],
        ],
      },
      {
        name: "Умный сад",
        slug: "smart-garden",
        children: [
          ["Роботы-газонокосилки", "robot-lawn-mowers"],
          ["Контроллеры полива", "watering-controllers"],
          ["Приводы для ворот", "gate-openers"],
          ["Уличные IP-камеры", "outdoor-ip-cameras"],
          ["Умные садовые светильники", "smart-garden-lights"],
        ],
      },
      {
        name: "Smart RTV и AGD",
        slug: "smart-rtv-agd",
        children: [
          ["Роботы-пылесосы", "smart-robot-vacuums"],
          ["Приставки Smart TV", "smart-home-tv-boxes"],
          ["Умные весы", "smart-scales"],
          ["Умные устройства для питомцев", "smart-pet-gadgets"],
        ],
      },
    ],
  },
  {
    name: "Фото и Видео",
    slug: "photo-video",
    description: "Камеры, объективы, экшн-камеры и аксессуары",
    children: [
      {
        name: "Фотоаппараты",
        slug: "cameras",
        children: [
          ["Компактные камеры", "compact-cameras"],
          ["Беззеркальные камеры", "mirrorless-cameras"],
          ["Зеркальные камеры", "dslr-cameras"],
          ["Моментальные камеры", "instant-cameras"],
        ],
      },
      {
        name: "Камеры",
        slug: "video-cameras",
        children: [
          ["Видеокамеры", "camcorders"],
          ["Экшн-камеры", "action-cameras"],
          ["Автомобильные камеры", "dash-cams"],
          ["Камеры 360 градусов", "360-cameras"],
          ["Камеры видеонаблюдения", "photo-security-cameras"],
        ],
      },
      {
        name: "Дроны",
        slug: "drones",
        children: [
          ["Дроны с камерой", "camera-drones"],
          ["Дроны DJI", "dji-drones"],
          ["Дроны с GPS", "gps-drones"],
          ["Аксессуары для дронов", "drone-accessories"],
        ],
      },
      {
        name: "Аксессуары",
        slug: "photo-accessories",
        children: [
          ["Объективы", "lenses"],
          ["Карты памяти", "memory-cards"],
          ["Штативы", "tripods"],
          ["Сумки и чехлы", "camera-bags"],
          ["Фильтры", "photo-filters"],
          ["Аккумуляторы и зарядки", "camera-batteries-chargers"],
        ],
      },
    ],
  },
];

const legacyCategorySlugs = [
  "components",
  "peripherals",
  "gaming",
  "pc-hardware",
  "office",
  "rtv",
  "computer-accessories",
  "cables-adapters",
  "bags-cases",
  "stands-holders",
  "gps-trackers",
  "headphones",
  "large-appliances",
  "cleaning-appliances",
  "climate",
  "beauty-health",
  "tv-accessories",
  "smart-sockets",
  "routers-network",
];

function collectCategorySlugs(items) {
  return items.flatMap((category) => [
    category.slug,
    ...collectCategorySlugs(
      (category.children ?? []).map((child) =>
        Array.isArray(child) ? { slug: child[1], children: [] } : child,
      ),
    ),
  ]);
}

function collectDescendantSlugs(category) {
  return (category.children ?? []).flatMap((child) => {
    const normalizedChild = Array.isArray(child) ? { slug: child[1], children: [] } : child;

    return [normalizedChild.slug, ...collectDescendantSlugs(normalizedChild)];
  });
}

const brands = [
  ["Apple", "apple", "Производитель компьютеров, смартфонов и персональной электроники"],
  ["Lenovo", "lenovo", "Производитель ноутбуков, ПК и компьютерной техники"],
  ["HP", "hp", "Производитель ноутбуков, ПК, принтеров и периферии"],
  ["Samsung", "samsung", "Производитель смартфонов, телевизоров и бытовой техники"],
  ["LG", "lg", "Производитель телевизоров, аудио и бытовой техники"],
  ["Bosch", "bosch", "Производитель бытовой техники для дома и кухни"],
  ["Sony", "sony", "Производитель аудио, видео, фото и gaming-устройств"],
  ["Xiaomi", "xiaomi", "Производитель смартфонов, умных устройств и аксессуаров"],
  ["ASUS", "asus", "Производитель ноутбуков, компьютеров и комплектующих"],
];

const specificationTemplateSeeds = {
  notebooks: [
    ["purpose", "Назначение", SpecValueType.SELECT, null, true, true, 10, ["gaming", "business", "home"]],
    ["os", "Операционная система", SpecValueType.SELECT, null, true, true, 20, ["Windows 11", "macOS", "ChromeOS", "Linux"]],
    ["processorFamily", "Семейство процессора", SpecValueType.SELECT, null, true, true, 30, ["Intel Core", "AMD Ryzen", "Apple Silicon"]],
    ["gpuSeries", "Серия видеокарты", SpecValueType.SELECT, null, false, true, 40, ["GeForce RTX", "Integrated", "Radeon"]],
    ["screenSize", "Диагональ экрана", SpecValueType.NUMBER, "дюйм", true, true, 50, []],
    ["processor", "Процессор", SpecValueType.STRING, null, true, true, 60, []],
    ["ram", "Оперативная память", SpecValueType.NUMBER, "GB", true, true, 70, []],
    ["ssd", "Объем SSD", SpecValueType.NUMBER, "GB", true, true, 80, []],
  ],
  smartphones: [
    ["modelLine", "Линейка", SpecValueType.STRING, null, true, true, 10, []],
    ["releaseYear", "Год выпуска", SpecValueType.NUMBER, null, true, true, 20, []],
    ["color", "Цвет", SpecValueType.STRING, null, true, true, 30, []],
    ["os", "Операционная система", SpecValueType.STRING, null, true, true, 40, []],
    ["waterResistance", "Защита корпуса", SpecValueType.STRING, null, true, true, 50, []],
    ["bodyMaterial", "Материал корпуса", SpecValueType.STRING, null, true, true, 60, []],
    ["screenSize", "Диагональ экрана", SpecValueType.NUMBER, "дюйма", true, true, 70, []],
    ["screenType", "Тип экрана", SpecValueType.STRING, null, true, true, 80, []],
    ["resolution", "Разрешение экрана", SpecValueType.STRING, null, true, true, 90, []],
    ["refreshRate", "Частота обновления", SpecValueType.NUMBER, "Гц", true, true, 100, []],
    ["peakBrightness", "Пиковая яркость", SpecValueType.NUMBER, "нит", true, true, 110, []],
    ["processor", "Процессор", SpecValueType.STRING, null, true, true, 120, []],
    ["cpuCores", "Количество ядер", SpecValueType.NUMBER, null, true, true, 130, []],
    ["ram", "Оперативная память", SpecValueType.NUMBER, "ГБ", true, true, 140, []],
    ["storage", "Встроенная память", SpecValueType.SELECT, "ГБ", true, true, 150, ["128", "256", "512"]],
    ["mainCamera", "Основная камера", SpecValueType.STRING, "Мп", true, true, 160, []],
    ["ultraWideCamera", "Сверхширокоугольная камера", SpecValueType.STRING, "Мп", true, true, 170, []],
    ["frontCamera", "Фронтальная камера", SpecValueType.STRING, "Мп", true, true, 180, []],
    ["videoRecording", "Запись видео", SpecValueType.STRING, null, true, true, 190, []],
    ["simCount", "Количество SIM", SpecValueType.NUMBER, null, true, true, 200, []],
    ["esim", "eSIM", SpecValueType.BOOLEAN, null, true, true, 210, []],
    ["nfc", "NFC", SpecValueType.BOOLEAN, null, true, true, 220, []],
    ["network5g", "5G", SpecValueType.BOOLEAN, null, true, true, 230, []],
    ["network4g", "4G", SpecValueType.BOOLEAN, null, true, true, 240, []],
    ["gps", "GPS", SpecValueType.BOOLEAN, null, true, true, 250, []],
    ["bluetooth", "Bluetooth", SpecValueType.STRING, null, true, true, 260, []],
    ["wifi", "Wi‑Fi", SpecValueType.STRING, null, true, true, 270, []],
    ["battery", "Емкость аккумулятора", SpecValueType.NUMBER, "мА·ч", true, true, 280, []],
    ["chargingPort", "Разъем зарядки", SpecValueType.STRING, null, true, true, 290, []],
    ["wirelessCharging", "Беспроводная зарядка", SpecValueType.BOOLEAN, null, true, true, 300, []],
    ["weight", "Вес", SpecValueType.NUMBER, "г", true, true, 310, []],
  ],
};

const specificationTemplateGroupSeeds = {
  smartphones: [
    { name: "Общие сведения", keys: ["modelLine", "releaseYear", "color", "os", "waterResistance", "bodyMaterial"] },
    { name: "Экран", keys: ["screenSize", "screenType", "resolution", "refreshRate", "peakBrightness"] },
    { name: "Производительность", keys: ["processor", "cpuCores", "ram", "storage"] },
    { name: "Камеры", keys: ["mainCamera", "ultraWideCamera", "frontCamera", "videoRecording"] },
    { name: "Связь", keys: ["simCount", "esim", "nfc", "network5g", "network4g", "gps", "bluetooth", "wifi"] },
    { name: "Питание и корпус", keys: ["battery", "chargingPort", "wirelessCharging", "weight"] },
  ],
};

const categoryCollections = {
  notebooks: [
    ["Игровые ноутбуки", "gaming-notebooks", { specs: { purpose: "gaming" } }, 10],
    ["Ноутбуки для бизнеса", "business-notebooks", { specs: { purpose: "business" } }, 20],
    ["Ноутбуки для дома", "home-notebooks", { specs: { purpose: "home" } }, 30],
    ["Ноутбуки Apple MacBook", "apple-macbook", { brandSlug: "apple" }, 40],
    ["Ноутбуки с Windows 11", "windows-11-notebooks", { specs: { os: "Windows 11" } }, 50],
    ["Ноутбуки с GeForce RTX", "geforce-rtx-notebooks", { specs: { gpuSeries: "GeForce RTX" } }, 60],
    ["Ноутбуки с AMD Ryzen", "amd-ryzen-notebooks", { specs: { processorFamily: "AMD Ryzen" } }, 70],
    ["Ноутбуки с Intel Core", "intel-core-notebooks", { specs: { processorFamily: "Intel Core" } }, 80],
    ["Хромбуки", "chromebooks", { specs: { os: "ChromeOS" } }, 90],
  ],
  smartphones: [
    ["Apple iPhone", "apple-iphone", { brandSlug: "apple" }, 10],
    ["Samsung Galaxy", "samsung-galaxy", { brandSlug: "samsung" }, 20],
    ["Смартфоны Xiaomi", "xiaomi-smartphones", { brandSlug: "xiaomi" }, 30],
  ],
};

const products = [
  {
    title: "Lenovo Legion 5 16IRX9",
    slug: "lenovo-legion-5-16irx9",
    sku: "NB-LEN-LEGION-5-16IRX9",
    description: "Игровой ноутбук Lenovo Legion 5 с экраном 16 дюймов и видеокартой GeForce RTX.",
    price: 5499.99,
    categorySlug: "notebooks",
    brandSlug: "lenovo",
    stock: 5,
    images: [],
    specs: { purpose: "gaming", os: "Windows 11", processorFamily: "Intel Core", gpuSeries: "GeForce RTX", screenSize: 16, processor: "Intel Core i7-14650HX", ram: 16, ssd: 1024 },
    additionalSpecs: [{ label: "Частота экрана", value: "165 Гц" }],
  },
  {
    title: "Apple MacBook Air 13 M3",
    slug: "apple-macbook-air-13-m3",
    sku: "NB-APL-MBA-13-M3",
    description: "Легкий ноутбук Apple MacBook Air 13 на чипе M3 для повседневной работы.",
    price: 4399.99,
    categorySlug: "notebooks",
    brandSlug: "apple",
    stock: 7,
    images: [],
    specs: { purpose: "home", os: "macOS", processorFamily: "Apple Silicon", screenSize: 13.6, processor: "Apple M3", ram: 16, ssd: 512 },
    additionalSpecs: [],
  },
  {
    title: "ASUS ExpertBook B5 B5404",
    slug: "asus-expertbook-b5-b5404",
    sku: "NB-ASUS-B5-B5404",
    description: "Бизнес-ноутбук ASUS ExpertBook B5 для офисной работы и командировок.",
    price: 3899.99,
    categorySlug: "notebooks",
    brandSlug: "asus",
    stock: 4,
    images: [],
    specs: { purpose: "business", os: "Windows 11", processorFamily: "Intel Core", gpuSeries: "Integrated", screenSize: 14, processor: "Intel Core Ultra 7 155U", ram: 16, ssd: 512 },
    additionalSpecs: [{ label: "Вес", value: "1.29 кг" }],
  },
  {
    title: "Apple iPhone 16 256 ГБ",
    slug: "apple-iphone-16-256gb",
    sku: "PH-APL-IP16-256",
    shortDescription: "6 ядер, 8 ГБ, 1 SIM, Super Retina XDR, 2556×1179, камера 48+12 Мп, NFC, 5G, 4G, GPS, 3561 мА·ч",
    description: "Apple iPhone 16 — компактный смартфон с ярким OLED-экраном Super Retina XDR, быстрым чипом A18 и камерой 48 Мп для повседневной съемки.",
    price: 3299.99,
    oldPrice: 3499.99,
    categorySlug: "smartphones",
    brandSlug: "apple",
    stock: 8,
    images: ["/products/iphone-16-demo.svg"],
    specs: { modelLine: "iPhone 16", releaseYear: 2024, color: "Ультрамарин", os: "iOS 18", waterResistance: "IP68", bodyMaterial: "Алюминий и стекло", screenSize: 6.1, screenType: "Super Retina XDR", resolution: "2556×1179", refreshRate: 60, peakBrightness: 2000, processor: "Apple A18", cpuCores: 6, ram: 8, storage: 256, mainCamera: "48+12", ultraWideCamera: "12", frontCamera: "12", videoRecording: "4K до 60 кадр/с", simCount: 1, esim: true, nfc: true, network5g: true, network4g: true, gps: true, bluetooth: "5.3", wifi: "Wi‑Fi 7", battery: 3561, chargingPort: "USB‑C", wirelessCharging: true, weight: 170 },
    additionalSpecs: [{ label: "Комплектация", value: "Смартфон, кабель USB‑C" }],
  },
  {
    title: "Apple iPhone 17 256 ГБ",
    slug: "apple-iphone-17-256gb",
    sku: "PH-APL-IP17-256",
    shortDescription: "6 ядер, 8 ГБ, 1 SIM, Super Retina XDR, 2622×1206, камера 48+48 Мп, NFC, 5G, 4G, GPS, 3692 мА·ч",
    description: "Apple iPhone 17 — смартфон с экраном 6.3 дюйма, чипом A19, частотой до 120 Гц и двойной камерой Fusion 48+48 Мп.",
    price: 3899.99,
    categorySlug: "smartphones",
    brandSlug: "apple",
    stock: 6,
    images: ["/products/iphone-17-demo.svg"],
    specs: { modelLine: "iPhone 17", releaseYear: 2025, color: "Голубой", os: "iOS 19", waterResistance: "IP68", bodyMaterial: "Алюминий и стекло", screenSize: 6.3, screenType: "Super Retina XDR", resolution: "2622×1206", refreshRate: 120, peakBrightness: 3000, processor: "Apple A19", cpuCores: 6, ram: 8, storage: 256, mainCamera: "48+48", ultraWideCamera: "48", frontCamera: "18", videoRecording: "4K Dolby Vision до 60 кадр/с", simCount: 1, esim: true, nfc: true, network5g: true, network4g: true, gps: true, bluetooth: "6", wifi: "Wi‑Fi 7", battery: 3692, chargingPort: "USB‑C", wirelessCharging: true, weight: 177 },
    additionalSpecs: [{ label: "Комплектация", value: "Смартфон, кабель USB‑C" }],
  },
];

const promoCodes = [
  {
    code: "WELCOME10",
    description: "Seed demo promo: скидка 10% для демонстрации",
    discountType: DiscountType.PERCENT,
    value: 10,
    maxDiscount: 300,
    minOrderTotal: 100,
    usageLimit: 100,
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2027-12-31T23:59:59.000Z"),
  },
  {
    code: "TECH50",
    description: "Seed demo promo: фиксированная скидка 50 BYN",
    discountType: DiscountType.FIXED,
    value: 50,
    minOrderTotal: 500,
    usageLimit: 200,
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2027-12-31T23:59:59.000Z"),
  },
];

const deliveryMethods = [
  {
    code: "courier",
    name: "Courier delivery",
    description: "Delivery to the customer address.",
    price: 15,
    sortOrder: 10,
  },
  {
    code: "pickup",
    name: "Store pickup",
    description: "Pickup from a TechMarket store.",
    price: 0,
    sortOrder: 20,
  },
  {
    code: "pickup_point",
    name: "Pickup point",
    description: "Delivery to a partner pickup point.",
    price: 7,
    sortOrder: 30,
  },
];

const paymentMethods = [
  {
    code: "cash_on_delivery",
    name: "Cash on delivery",
    description: "Payment when receiving the order.",
    sortOrder: 10,
  },
  {
    code: "card_mock",
    name: "Bank card mock",
    description: "Demo card payment without a real payment provider.",
    sortOrder: 20,
  },
  {
    code: "online_mock",
    name: "Online payment mock",
    description: "Online payment stub for diploma demonstration.",
    sortOrder: 30,
  },
];

function normalizeCategory(category) {
  if (Array.isArray(category)) {
    const [name, slug, description] = category;

    return {
      name,
      slug,
      description: description ?? `${name} в каталоге TechMarket`,
      children: [],
    };
  }

  return {
    ...category,
    children: category.children ?? [],
  };
}

async function upsertCategoryTree(categoryNodes, parentId = null) {
  for (const [index, categoryNode] of categoryNodes.entries()) {
    const categoryData = normalizeCategory(categoryNode);
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        parentId,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        parentId,
        sortOrder: index + 1,
      },
    });

    await upsertCategoryTree(categoryData.children, category.id);
  }
}

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        role: user.role,
        isBlocked: false,
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        role: user.role,
      },
    });
  }

  await upsertCategoryTree(categories);
  await prisma.category.deleteMany({
    where: {
      slug: {
        in: ["apple-iphone", "samsung-galaxy", "xiaomi-smartphones", "5g-smartphones", "senior-phones"],
      },
    },
  });

  const menuCategorySlugs = collectCategorySlugs(categories);

  const staleProducts = await prisma.product.findMany({
    where: { sku: { notIn: products.map((product) => product.sku) } },
    select: { id: true },
  });
  const staleProductIds = staleProducts.map((product) => product.id);

  if (staleProductIds.length) {
    await prisma.orderItem.deleteMany({ where: { productId: { in: staleProductIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: staleProductIds } } });
    await prisma.cartItem.deleteMany({ where: { productId: { in: staleProductIds } } });
    await prisma.wishlistItem.deleteMany({ where: { productId: { in: staleProductIds } } });
    await prisma.product.deleteMany({ where: { id: { in: staleProductIds } } });
  }

  await prisma.category.deleteMany({
    where: { slug: { notIn: menuCategorySlugs } },
  });

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

  for (const [categorySlug, templates] of Object.entries(specificationTemplateSeeds)) {
    const category = categoryBySlug[categorySlug];

    await prisma.specificationTemplate.upsert({
      where: { categoryId: category.id },
      update: {
        name: `Характеристики: ${category.name}`,
      },
      create: {
        name: `Характеристики: ${category.name}`,
        categoryId: category.id,
      },
    });

    const template = await prisma.specificationTemplate.findUnique({
      where: { categoryId: category.id },
    });

    if (template) {
      await prisma.specificationGroup.deleteMany({
        where: { templateId: template.id },
      });

      const groups = specificationTemplateGroupSeeds[categorySlug] ?? [
        { name: "Основные характеристики", keys: templates.map(([key]) => key) },
      ];
      const templatesByKey = new Map(templates.map((template) => [template[0], template]));

      for (const [groupIndex, group] of groups.entries()) {
        await prisma.specificationGroup.create({
          data: {
            templateId: template.id,
            name: group.name,
            sortOrder: groupIndex + 1,
            specifications: {
              create: group.keys
                .map((key) => templatesByKey.get(key))
                .filter(Boolean)
                .map(([key, label, type, unit, isRequired, _isComparable, sortOrder, options]) => ({
                  key,
                  name: label,
                  type,
                  unit,
                  isRequired,
                  sortOrder,
                  options: {
                    create: options.map((value, index) => ({
                      value,
                      sortOrder: index + 1,
                    })),
                  },
                })),
            },
          },
        });
      }
    }
  }

  for (const [categorySlug, collections] of Object.entries(categoryCollections)) {
    const category = categoryBySlug[categorySlug];

    for (const [name, slug, conditions, sortOrder] of collections) {
      await prisma.categoryCollection.upsert({
        where: { slug },
        update: { name, conditions, sortOrder, categoryId: category.id, isActive: true },
        create: { name, slug, conditions, sortOrder, categoryId: category.id },
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
        shortDescription: product.shortDescription ?? null,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        additionalSpecs: product.additionalSpecs ?? [],
        isActive: true,
        categoryId: category.id,
        brandId: brand.id,
      },
      create: {
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription ?? null,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        additionalSpecs: product.additionalSpecs ?? [],
        categoryId: category.id,
        brandId: brand.id,
      },
    });
  }

  for (const promoCode of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promoCode.code },
      update: {
        description: promoCode.description,
        discountType: promoCode.discountType,
        value: promoCode.value,
        maxDiscount: promoCode.maxDiscount ?? null,
        minOrderTotal: promoCode.minOrderTotal ?? null,
        usageLimit: promoCode.usageLimit ?? null,
        startsAt: promoCode.startsAt,
        endsAt: promoCode.endsAt,
        isActive: true,
      },
      create: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        value: promoCode.value,
        maxDiscount: promoCode.maxDiscount ?? null,
        minOrderTotal: promoCode.minOrderTotal ?? null,
        usageLimit: promoCode.usageLimit ?? null,
        startsAt: promoCode.startsAt,
        endsAt: promoCode.endsAt,
      },
    });
  }

  for (const deliveryMethod of deliveryMethods) {
    await prisma.deliveryMethod.upsert({
      where: { code: deliveryMethod.code },
      update: {
        name: deliveryMethod.name,
        description: deliveryMethod.description,
        price: deliveryMethod.price,
        sortOrder: deliveryMethod.sortOrder,
        isActive: true,
      },
      create: deliveryMethod,
    });
  }

  for (const paymentMethod of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: paymentMethod.code },
      update: {
        name: paymentMethod.name,
        description: paymentMethod.description,
        sortOrder: paymentMethod.sortOrder,
        isActive: true,
      },
      create: paymentMethod,
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
          { sku: "NB-LEN-LEGION-5-16IRX9", quantity: 1 },
          { sku: "NB-APL-MBA-13-M3", quantity: 1 },
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
        items: [{ sku: "NB-ASUS-B5-B5404", quantity: 1 }],
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
      const orderIndex = demoOrders.indexOf(demoOrder) + 1;
      const totalPrice = demoOrder.items.reduce((sum, item) => {
        const product = productBySku[item.sku];
        return sum + Number(product.price) * item.quantity;
      }, 0);

      await prisma.order.create({
        data: {
          orderNumber: `TM-2026-${String(orderIndex).padStart(6, "0")}`,
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
          statusHistory: {
            create: [
              {
                toStatus: OrderStatus.NEW,
                adminComment: "Seed: заказ создан для демонстрации",
              },
              {
                fromStatus: OrderStatus.NEW,
                toStatus: demoOrder.status,
                adminComment: "Seed: демонстрационное изменение статуса",
              },
            ],
          },
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

    await prisma.notification.deleteMany({
      where: {
        userId: demoUser.id,
        title: { startsWith: "Seed demo notification" },
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: demoUser.id,
          type: NotificationType.SYSTEM,
          title: "Seed demo notification: добро пожаловать",
          message: "Добро пожаловать в TechMarket. Здесь будут появляться уведомления о заказах и статусах доставки.",
          emailMockSent: true,
          emailMockPayload: {
            to: demoUser.email,
            subject: "TechMarket: добро пожаловать",
            body: "Это демонстрационная mock email-запись без реальной SMTP-отправки.",
            mock: true,
          },
        },
        {
          userId: demoUser.id,
          type: NotificationType.ORDER_STATUS_CHANGED,
          title: "Seed demo notification: статус заказа изменен",
          message: "Статус демонстрационного заказа изменен на PROCESSING.",
          emailMockSent: true,
          emailMockPayload: {
            to: demoUser.email,
            subject: "TechMarket: статус заказа изменен",
            body: "Это пример уведомления о смене статуса заказа.",
            mock: true,
          },
        },
      ],
    });
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
      { user: demoUser, sku: "NB-LEN-LEGION-5-16IRX9", rating: 5, comment: "Seed demo review: мощный игровой ноутбук." },
      { user: demoAdmin, sku: "NB-APL-MBA-13-M3", rating: 5, comment: "Seed demo review: легкий ноутбук для повседневной работы." },
      { user: demoUser, sku: "NB-ASUS-B5-B5404", rating: 4, comment: "Seed demo review: удобная бизнес-модель." },
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
