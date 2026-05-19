import "../static-pages/StaticPages.css";
import "./OrderHelpPage.css"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function OrderHelpPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));

    if (!target) {
      return;
    }

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hash]);

  return (
    <section className="service_page" aria-labelledby="order_help_page_title">
      <div className="service_page_inner">
        <h1 id="order_help_page_title">Покупателям</h1>

        <nav className="help_navigation">
        <ul>
          <li><a href="#how_to_order">Как оформить заказ</a></li>
          <li><a href="#payment_and_delivery">Оплата и Доставка</a></li>
          <li><a href="#warranty_and_return">Гарантия и возврат</a></li>
          <li><a href="#privacy_policy">Политика конфиденциальности</a></li>
        </ul>
      </nav>

      {/* Раздел: Как оформить заказ */}
      <section id="how_to_order" className="help_section">
        <h2>Как оформить заказ</h2>
        
        <div className="help_content">
          <h3>Пошаговая инструкция:</h3>
          <ol>
            <li>Выберите интересующий вас товар в каталоге</li>
            <li>Добавьте товар в корзину, нажав кнопку "В корзину"</li>
            <li>Перейдите в корзину и проверьте выбранные товары</li>
            <li>Нажмите кнопку "Оформить заказ"</li>
            <li>Заполните контактные данные: имя, телефон, email</li>
            <li>Выберите удобный способ доставки</li>
            <li>Выберите способ оплаты</li>
            <li>Подтвердите заказ</li>
          </ol>
          
          <div className="help_note">
            <p>После оформления заказа на ваш email придёт письмо с подтверждением. 
            Наш менеджер свяжется с вами в течение 30 минут для уточнения деталей.</p>
          </div>
        </div>
      </section>

      {/* Раздел: Оплата и Доставка */}
      <section id="payment_and_delivery" className="help_section">
        <h2>Оплата и Доставка</h2>
        
        <div className="help_content">
          <h3>Способы оплаты:</h3>
          <ul>
            <li><strong>Наличными</strong> — при получении товара курьеру</li>
            <li><strong>Банковской картой</strong> — онлайн через защищённый платёжный шлюз</li>
            <li><strong>Банковским переводом</strong> — по реквизитам для юридических лиц</li>
            <li><strong>Оплата частями</strong> — доступна для заказов от 3000 ₽</li>
          </ul>

          <h3>Способы доставки:</h3>
          <table className="delivery_table">
            <thead>
              <tr>
                <th>Способ доставки</th>
                <th>Срок</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Курьером по городу</td>
                <td>1-2 дня</td>
                <td>от 300 ₽</td>
              </tr>
              <tr>
                <td>Почта России</td>
                <td>5-10 дней</td>
                <td>от 250 ₽</td>
              </tr>
              <tr>
                <td>СДЭК</td>
                <td>2-5 дней</td>
                <td>от 350 ₽</td>
              </tr>
              <tr>
                <td>Самовывоз</td>
                <td>сегодня</td>
                <td>бесплатно</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Раздел: Гарантия и возврат */}
      <section id="warranty_and_return" className="help_section">
        <h2>Гарантия и возврат</h2>
        
        <div className="help_content">
          <h3>Гарантийные обязательства:</h3>
          <ul>
            <li>Гарантия на все товары — 12 месяцев с даты покупки</li>
            <li>На электронику и бытовую технику — расширенная гарантия 24 месяца</li>
            <li>Бесплатное гарантийное обслуживание в авторизованных сервисных центрах</li>
            <li>Сохранение гарантии при правильной эксплуатации согласно инструкции</li>
          </ul>

          <h3>Условия возврата:</h3>
          <ul>
            <li>Вернуть товар можно в течение 14 дней с момента получения</li>
            <li>Товар должен быть в оригинальной упаковке без следов использования</li>
            <li>При возврате денежные средства возвращаются в течение 3-10 рабочих дней</li>
            <li>Возврат возможен через курьерскую службу или в пункте самовывоза</li>
          </ul>

          <h3>Не подлежат возврату:</h3>
          <ul>
            <li>Товары с нарушенной упаковкой</li>
            <li>Предметы личной гигиены</li>
            <li>Продукты питания</li>
            <li>Товары, изготовленные на заказ</li>
          </ul>

          <div className="help_contact">
            <p>Для оформления возврата свяжитесь с нами:</p>
            <p>📞 Телефон: 8 (800) 123-45-67</p>
            <p>📧 Email: support@shop.ru</p>
          </div>
        </div>
      </section>

      <section id="privacy_policy" className="help_section">
        <h2 className="policy_title">Политика <span className="text_red">конфиденциальности</span></h2>
        
        <div className="accordion_container">
          <details className="accordion_item">
            <summary>Основные положения</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Основные понятия</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Оператор может обрабатывать следующие персональные данные Пользователя</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Цели обработки персональных данных</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Правовые основания обработки персональных данных</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Порядок сбора, хранения, передачи и других видов обработки персональных данных</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Трансграничная передача персональных данных</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Заключительные положения</summary>
            <div className="accordion_content"></div>
          </details>
        </div>

        <h2 className="policy_title" style={{ marginTop: '3rem' }}>Публичная <span className="text_red">оферта</span></h2>
        <div className="accordion_container">
          <details className="accordion_item">
            <summary>Положение</summary>
            <div className="accordion_content"></div>
          </details>
          <details className="accordion_item">
            <summary>Введение</summary>
            <div className="accordion_content"></div>
          </details>
        </div>
      </section>

      </div>
    </section>
  );
}
