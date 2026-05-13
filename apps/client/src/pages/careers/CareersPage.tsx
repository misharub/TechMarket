import "../static-pages/StaticPages.css";
import "./CareersPage.css"


export function CareersPage() {
  return (
    <section className="service_page" aria-labelledby="careers_page_title">
      <div className="service_page_inner">
        <h1 id="careers_page_title">Вакансии</h1>
        <p className="justify_center flex">Мы ищем талантливых специалистов для присоединения к нашей команде. Присоединяйтесь к нам и станьте частью инновационной команды!</p>
      </div>
    </section>
  );
}
