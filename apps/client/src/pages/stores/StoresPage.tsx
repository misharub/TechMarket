import "../static-pages/StaticPages.css";
import "./StoresPage.css";

export function StoresPage() {
  return (
    <section className="service_page" aria-labelledby="stores_page_title">
      <div className="service_page_inner">
        <h1 id="stores_page_title">Найти салон</h1>

        <div className="stores_content">
          <p>
            Раздел предназначен для демонстрации страницы поиска торговых точек интернет-магазина
            <strong> TechMarket</strong>. Так как сайт разрабатывается в рамках дипломного проекта,
            реальные адреса салонов и пунктов самовывоза на данный момент не используются.
          </p>

          <section className="stores_card" aria-labelledby="stores_demo_title">
            <h2 id="stores_demo_title">Демо-информация</h2>
            <p>
              В рабочей версии здесь может отображаться список салонов, карта города, фильтр по району
              и режиму работы, а также карточка выбранной точки обслуживания.
            </p>
          </section>

          <section className="stores_card" aria-labelledby="stores_options_title">
            <h2 id="stores_options_title">Что сможет выбрать покупатель</h2>
            <ul>
              <li>ближайший салон или пункт самовывоза;</li>
              <li>удобный способ получения заказа;</li>
              <li>время работы торговой точки;</li>
              <li>контактный номер для уточнения наличия товара.</li>
            </ul>
          </section>

          <section className="stores_card" aria-labelledby="stores_status_title">
            <h2 id="stores_status_title">Статус раздела</h2>
            <p>
              Для дипломного проекта страница заполнена вводной информацией без привязки к конкретным
              местоположениям. Данные салонов могут быть добавлены позже через базу данных или
              административную панель.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
