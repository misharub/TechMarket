import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

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

async function main() {
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
