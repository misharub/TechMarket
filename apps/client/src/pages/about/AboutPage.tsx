import "../static-pages/StaticPages.css";
import "./AboutPage.css"
export function AboutPage() {
  return (
    <section className="service_page" aria-labelledby="about_page_title">
      <div className="service_page_inner">
        <h1 id="about_page_title">О компании</h1>

        <div className="about_content">
          <p>
            <strong>TechMarket</strong> — это современная интернет-платформа для продажи компьютерной техники и электроники,
            разработанная в рамках дипломного проекта.
          </p>

          <p>
            Наша цель — создать удобный и функциональный онлайн-магазин, который демонстрирует применение
            современных технологий веб-разработки: React, TypeScript, Node.js и PostgreSQL.
          </p>

          <h2>Технологии проекта</h2>
          <ul>
            <li><strong>Frontend:</strong> React + TypeScript + Vite</li>
            <li><strong>Backend:</strong> NestJS + Node.js</li>
            <li><strong>База данных:</strong> PostgreSQL с Prisma ORM</li>
            <li><strong>Стилизация:</strong> CSS Modules + BEM методология</li>
            <li><strong>Архитектура:</strong> Микросервисная с REST API</li>
          </ul>

          <h2>Функциональность</h2>
          <p>
            Платформа предоставляет полный спектр возможностей современного e-commerce:
            каталог товаров, систему поиска и фильтрации, корзину покупок, личный кабинет,
            систему отзывов и рейтингов, интеграцию с платежными системами.
          </p>

          
        </div>

      </div>
    </section>
  );
}
