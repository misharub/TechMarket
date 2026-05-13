import "../static-pages/StaticPages.css";
import "./StoresPage.css";

export function StoresPage() {
  return (
    <section className="service-page" aria-labelledby="stores-page-title">
      <div className="service-page_inner">
        <h1 id="stores-page-title">Найти салон</h1>

        <div className="stores-content">
          <p>
            Раздел предназначен для демонстрации страницы поиска торговых точек интернет-магазина
            <strong> TechMarket</strong>. Так как сайт разрабатывается в рамках дипломного проекта,
            реальные адреса салонов и пунктов самовывоза на данный момент не используются.
          </p>

          <section className="stores-card" aria-labelledby="stores-demo-title">
            <h2 id="stores-demo-title">Демо-информация</h2>
            <p>
              В рабочей версии здесь может отображаться список салонов, карта города, фильтр по району
              и режиму работы, а также карточка выбранной точки обслуживания.
            </p>
          </section>

          <section className="stores-card" aria-labelledby="stores-options-title">
            <h2 id="stores-options-title">Что сможет выбрать покупатель</h2>
            <ul>
              <li>ближайший салон или пункт самовывоза;</li>
              <li>удобный способ получения заказа;</li>
              <li>время работы торговой точки;</li>
              <li>контактный номер для уточнения наличия товара.</li>
            </ul>
          </section>

          <section className="stores-card" aria-labelledby="stores-status-title">
            <h2 id="stores-status-title">Статус раздела</h2>
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
