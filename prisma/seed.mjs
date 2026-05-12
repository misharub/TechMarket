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
  {
    name: "Ноутбуки и компьютеры",
    slug: "laptops-computers",
    description: "Ноутбуки, ПК, моноблоки, планшеты и электронные книги",
    children: [
      {
        name: "Ноутбуки",
        slug: "notebooks",
        description: "Ноутбуки для дома, учебы, бизнеса и игр",
        children: [
          ["Игровые ноутбуки", "gaming-notebooks"],
          ["Ноутбуки для бизнеса", "business-notebooks"],
          ["Ноутбуки для дома", "home-notebooks"],
          ["Ноутбуки Apple MacBook", "apple-macbook"],
          ["Ноутбуки с Windows 11", "windows-11-notebooks"],
          ["Ноутбуки с GeForce RTX", "geforce-rtx-notebooks"],
          ["Ноутбуки с AMD Ryzen", "amd-ryzen-notebooks"],
          ["Ноутбуки с Intel Core", "intel-core-notebooks"],
          ["Хромбуки", "chromebooks"],
          ["Аксессуары для ноутбуков", "laptop-accessories"],
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
        name: "Аксессуары для ноутбуков",
        slug: "notebook-accessories",
        children: [
          ["Внешние диски", "external-drives"],
          ["Сумки для ноутбуков", "laptop-bags"],
          ["Рюкзаки для ноутбуков", "laptop-backpacks"],
          ["Охлаждающие подставки", "laptop-cooling-stands"],
          ["Док-станции", "docking-stations"],
        ],
      },
      {
        name: "Аксессуары для планшетов",
        slug: "tablet-accessories",
        children: [
          ["Кабели USB", "usb-cables"],
          ["Защитные стекла", "tablet-screen-protectors"],
          ["Клавиатуры для планшетов", "tablet-keyboards"],
          ["Чехлы для планшетов", "tablet-cases"],
          ["Стилусы", "styluses"],
        ],
      },
      {
        name: "Аксессуары для телефонов и часов",
        slug: "phone-watch-accessories",
        children: [
          ["Наушники", "accessory-phone-headphones"],
          ["Power Bank", "accessory-powerbanks"],
          ["Чехлы для телефонов", "accessory-phone-cases"],
          ["Защита экрана", "accessory-phone-screen-protectors"],
          ["Ремешки для часов", "accessory-watch-straps"],
        ],
      },
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
        children: [
          ["Apple iPhone", "apple-iphone"],
          ["Samsung Galaxy", "samsung-galaxy"],
          ["Смартфоны Xiaomi", "xiaomi-smartphones"],
          ["Смартфоны 5G", "5g-smartphones"],
          ["Телефоны для пожилых", "senior-phones"],
        ],
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
    categorySlug: "home-notebooks",
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
    categorySlug: "apple-macbook",
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
    categorySlug: "home-notebooks",
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
    categorySlug: "samsung-galaxy",
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
    categorySlug: "xiaomi-smartphones",
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
    categorySlug: "refrigerators",
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
    categorySlug: "washing-machines",
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
    categorySlug: "qled-tvs",
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
    categorySlug: "oled-tvs",
    brandSlug: "sony",
    stock: 4,
    images: ["/uploads/products/sony-bravia-65-oled.jpg"],
    specs: { screenSize: 65, resolution: "4K UHD", smartTv: true, power: 60 },
  },
  {
    title: "Lenovo Legion 5 Pro 16",
    slug: "lenovo-legion-5-pro-16",
    sku: "NB-LEN-0002",
    description: "Игровой ноутбук Lenovo с мощной графикой, экраном 16 дюймов и быстрым SSD.",
    price: 4999.99,
    oldPrice: 5499.99,
    categorySlug: "gaming-notebooks",
    brandSlug: "lenovo",
    stock: 5,
    images: ["/uploads/products/lenovo-legion-5-pro-16.jpg"],
    specs: { screenSize: 16, processor: "AMD Ryzen 7", ram: 32, ssd: 1024, os: "Windows 11" },
  },
  {
    title: "HP Envy x360 14",
    slug: "hp-envy-x360-14",
    sku: "NB-HP-0002",
    description: "Трансформируемый ноутбук HP для учебы, презентаций и мобильной работы.",
    price: 3199.99,
    oldPrice: 3499.99,
    categorySlug: "business-notebooks",
    brandSlug: "hp",
    stock: 8,
    images: ["/uploads/products/hp-envy-x360-14.jpg"],
    specs: { screenSize: 14, processor: "Intel Core Ultra 5", ram: 16, ssd: 512, os: "Windows 11" },
  },
  {
    title: "Apple MacBook Pro 14 M4",
    slug: "apple-macbook-pro-14-m4",
    sku: "NB-APL-0002",
    description: "Профессиональный ноутбук Apple для разработки, дизайна и монтажа.",
    price: 7499.99,
    categorySlug: "apple-macbook",
    brandSlug: "apple",
    stock: 4,
    images: ["/uploads/products/apple-macbook-pro-14-m4.jpg"],
    specs: { screenSize: 14.2, processor: "Apple M4", ram: 24, ssd: 1024, os: "macOS" },
  },
  {
    title: "Apple iPhone 16",
    slug: "apple-iphone-16",
    sku: "PH-APL-0001",
    description: "Смартфон Apple с ярким OLED-экраном, быстрой камерой и большим запасом памяти.",
    price: 3999.99,
    oldPrice: 4299.99,
    categorySlug: "apple-iphone",
    brandSlug: "apple",
    stock: 14,
    images: ["/uploads/products/apple-iphone-16.jpg"],
    specs: { screenSize: 6.1, memory: 256, camera: 48, nfc: true },
  },
  {
    title: "Samsung Galaxy A56",
    slug: "samsung-galaxy-a56",
    sku: "PH-SAM-0002",
    description: "Сбалансированный смартфон Samsung с большим AMOLED-экраном и NFC.",
    price: 1599.99,
    oldPrice: 1799.99,
    categorySlug: "samsung-galaxy",
    brandSlug: "samsung",
    stock: 21,
    images: ["/uploads/products/samsung-galaxy-a56.jpg"],
    specs: { screenSize: 6.7, memory: 256, camera: 50, nfc: true },
  },
  {
    title: "Xiaomi Watch S4",
    slug: "xiaomi-watch-s4",
    sku: "PH-XIA-0002",
    description: "Смарт-часы Xiaomi с ярким дисплеем, спортивными режимами и долгой автономностью.",
    price: 599.99,
    categorySlug: "smartwatches",
    brandSlug: "xiaomi",
    stock: 19,
    images: ["/uploads/products/xiaomi-watch-s4.jpg"],
    specs: { screenSize: 1.43, memory: 32, camera: 0, nfc: true },
  },
  {
    title: "Bosch Serie 6 Dishwasher",
    slug: "bosch-serie-6-dishwasher",
    sku: "HA-BOS-0002",
    description: "Встраиваемая посудомоечная машина Bosch с тихой работой и экономичным расходом воды.",
    price: 2499.99,
    oldPrice: 2799.99,
    categorySlug: "dishwashers",
    brandSlug: "bosch",
    stock: 7,
    images: ["/uploads/products/bosch-serie-6-dishwasher.jpg"],
    specs: { deviceType: "Посудомоечная машина", energyClass: "A++", capacity: 13, color: "White" },
  },
  {
    title: "LG CordZero A9",
    slug: "lg-cordzero-a9",
    sku: "HA-LG-0002",
    description: "Беспроводной пылесос LG для ежедневной уборки квартиры и дома.",
    price: 1499.99,
    oldPrice: 1699.99,
    categorySlug: "vacuum-cleaners",
    brandSlug: "lg",
    stock: 10,
    images: ["/uploads/products/lg-cordzero-a9.jpg"],
    specs: { deviceType: "Пылесос", energyClass: "A", capacity: 1, color: "Silver" },
  },
  {
    title: "Xiaomi Robot Vacuum X20",
    slug: "xiaomi-robot-vacuum-x20",
    sku: "HA-XIA-0001",
    description: "Робот-пылесос Xiaomi с влажной уборкой, картой помещения и базовой станцией.",
    price: 1899.99,
    oldPrice: 2199.99,
    categorySlug: "robot-vacuums",
    brandSlug: "xiaomi",
    stock: 13,
    images: ["/uploads/products/xiaomi-robot-vacuum-x20.jpg"],
    specs: { deviceType: "Робот-пылесос", energyClass: "A", capacity: 4, color: "White" },
  },
  {
    title: "Samsung Neo QLED 65",
    slug: "samsung-neo-qled-65",
    sku: "TV-SAM-0002",
    description: "Большой телевизор Samsung Neo QLED с высокой яркостью и Smart TV.",
    price: 6899.99,
    oldPrice: 7399.99,
    categorySlug: "qled-tvs",
    brandSlug: "samsung",
    stock: 6,
    images: ["/uploads/products/samsung-neo-qled-65.jpg"],
    specs: { screenSize: 65, resolution: "4K UHD", smartTv: true, power: 60 },
  },
  {
    title: "LG OLED C4 55",
    slug: "lg-oled-c4-55",
    sku: "TV-LG-0001",
    description: "OLED-телевизор LG с глубоким черным цветом, игровым режимом и Smart TV.",
    price: 5299.99,
    oldPrice: 5799.99,
    categorySlug: "oled-tvs",
    brandSlug: "lg",
    stock: 5,
    images: ["/uploads/products/lg-oled-c4-55.jpg"],
    specs: { screenSize: 55, resolution: "4K UHD", smartTv: true, power: 40 },
  },
  {
    title: "Sony HT-S400 Soundbar",
    slug: "sony-ht-s400-soundbar",
    sku: "TV-SON-0002",
    description: "Саундбар Sony с беспроводным сабвуфером для телевизора и домашнего кино.",
    price: 1099.99,
    categorySlug: "soundbars",
    brandSlug: "sony",
    stock: 16,
    images: ["/uploads/products/sony-ht-s400-soundbar.jpg"],
    specs: { screenSize: 0, resolution: "Audio", smartTv: false, power: 330 },
  },
  {
    title: "Xiaomi Smart Camera C500 Pro",
    slug: "xiaomi-smart-camera-c500-pro",
    sku: "SH-XIA-0001",
    description: "Умная камера Xiaomi для квартиры с высоким разрешением и ночным режимом.",
    price: 349.99,
    oldPrice: 429.99,
    categorySlug: "security-cameras",
    brandSlug: "xiaomi",
    stock: 27,
    images: ["/uploads/products/xiaomi-smart-camera-c500-pro.jpg"],
    specs: {},
  },
  {
    title: "Samsung SmartThings Station",
    slug: "samsung-smartthings-station",
    sku: "SH-SAM-0001",
    description: "Хаб Samsung для управления устройствами умного дома и сценариями автоматизации.",
    price: 499.99,
    categorySlug: "intelligent-home",
    brandSlug: "samsung",
    stock: 9,
    images: ["/uploads/products/samsung-smartthings-station.jpg"],
    specs: {},
  },
  {
    title: "Apple AirPods Pro 2",
    slug: "apple-airpods-pro-2",
    sku: "AC-APL-0001",
    description: "Беспроводные наушники Apple с активным шумоподавлением и кейсом MagSafe.",
    price: 899.99,
    oldPrice: 999.99,
    categorySlug: "accessory-phone-headphones",
    brandSlug: "apple",
    stock: 23,
    images: ["/uploads/products/apple-airpods-pro-2.jpg"],
    specs: {},
  },
  {
    title: "Samsung 25W USB-C Charger",
    slug: "samsung-25w-usb-c-charger",
    sku: "AC-SAM-0001",
    description: "Компактное зарядное устройство Samsung USB-C для смартфонов и планшетов.",
    price: 79.99,
    categorySlug: "chargers",
    brandSlug: "samsung",
    stock: 42,
    images: ["/uploads/products/samsung-25w-usb-c-charger.jpg"],
    specs: {},
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

  await upsertCategoryTree(categories);

  await prisma.category.updateMany({
    where: { slug: { in: legacyCategorySlugs } },
    data: {
      parentId: null,
      isActive: false,
    },
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
