# Служебные страницы TechMarket

## Назначение

Для ссылок из header и footer добавлены отдельные page-компоненты. Это не общий компонент-заглушка: у каждой страницы есть собственный `.tsx` файл, который можно независимо расширять контентом, формами и будущей логикой.

## Маршруты и файлы

- `/contacts` - `ContactsPage.tsx`, контакты.
- `/stores` - `StoresPage.tsx`, поиск салона.
- `/compare` - `ComparePage.tsx`, сравнение товаров.
- `/cart` - `CartPage.tsx`, корзина.
- `/login` - `LoginPage.tsx`, вход.
- `/about` - `AboutPage.tsx`, о компании.
- `/careers` - `CareersPage.tsx`, вакансии.
- `/help/order` - `OrderHelpPage.tsx`, оформление заказа.
- `/help/payment` - `PaymentHelpPage.tsx`, оплата и доставка.
- `/help/warranty` - `WarrantyHelpPage.tsx`, гарантия и возврат.

## Текущее состояние

Каждая страница подключена через общий `MainLayout`, поэтому отображает существующие header и footer. В основной части пока находится только заголовок страницы. Общий минимальный CSS вынесен в `StaticPages.css`; содержимое каждой страницы редактируется отдельно в ее компоненте.
