function App() {
  return (
    // Главный контейнер приложения: пока здесь простая проверка, что Tailwind подключен.
    <div className="min-h-screen bg-white text-slate-950">
      {/* Стартовый экран TechMarket: позже заменим его на полноценную главную страницу. */}
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        {/* Название проекта: проверяем фирменный бирюзовый цвет и типографику. */}
        <h1 className="text-5xl font-bold text-teal-700">TechMarket</h1>

        {/* Короткое описание текущего этапа frontend-разработки. */}
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Frontend-клиент запущен. Tailwind CSS подключен, дальше начнём собирать интерфейс интернет-магазина.
        </p>

        {/* Временная кнопка для проверки базовых классов кнопок и отступов. */}
        <button className="mt-8 rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">
          Начать разработку интерфейса
        </button>
      </main>
    </div>
  );
}

export default App;
