ПРИЛОЖЕНИЕ В
(справочное)
Описание физической модели базы данных

Физическая модель базы данных веб-приложения интернет-магазина TechMarket реализована с использованием PostgreSQL и Prisma ORM. В модели выделены таблицы для хранения пользователей, каталога товаров, характеристик, заказов, корзины, отзывов, способов доставки и оплаты, а также служебных данных, необходимых для работы авторизации и уведомлений.

Ниже приведено описание основных таблиц физической модели базы данных. В таблицах указаны поля, типы данных и назначение полей. Поля с суффиксом Id используются как внешние ключи для связи с другими таблицами.

Таблица В.1 - Структура таблицы User

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор пользователя |
| email | String | Адрес электронной почты пользователя |
| passwordHash | String | Хэш пароля пользователя |
| firstName | String | Имя пользователя |
| lastName | String | Фамилия пользователя |
| phone | String | Номер телефона |
| role | Role | Роль пользователя в системе |
| isBlocked | Boolean | Признак блокировки учетной записи |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.2 - Структура таблицы OAuthAccount

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор внешней учетной записи |
| userId | String | Идентификатор пользователя |
| provider | OAuthProvider | Провайдер внешней авторизации |
| providerUserId | String | Идентификатор пользователя на стороне провайдера |
| email | String | Адрес электронной почты, полученный от провайдера |
| createdAt | DateTime | Дата создания записи |

Таблица В.3 - Структура таблицы RefreshSession

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор сессии обновления токена |
| userId | String | Идентификатор пользователя |
| tokenHash | String | Хэш refresh token |
| expiresAt | DateTime | Дата и время истечения срока действия токена |
| revokedAt | DateTime | Дата и время отзыва токена |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.4 - Структура таблицы Category

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор категории |
| name | String | Наименование категории |
| slug | String | Уникальный адрес категории |
| description | String | Описание категории |
| image | String | Ссылка на изображение категории |
| sortOrder | Int | Порядок отображения категории |
| isActive | Boolean | Признак активности категории |
| parentId | String | Идентификатор родительской категории |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.5 - Структура таблицы SpecificationTemplate

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор шаблона характеристик |
| name | String | Наименование шаблона характеристик |
| categoryId | String | Идентификатор категории, к которой относится шаблон |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.6 - Структура таблицы SpecificationGroup

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор группы характеристик |
| templateId | String | Идентификатор шаблона характеристик |
| name | String | Наименование группы характеристик |
| sortOrder | Int | Порядок отображения группы |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.7 - Структура таблицы Specification

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор характеристики |
| groupId | String | Идентификатор группы характеристик |
| key | String | Системное имя характеристики |
| name | String | Отображаемое название характеристики |
| type | SpecValueType | Тип значения характеристики |
| unit | String | Единица измерения |
| isRequired | Boolean | Признак обязательности заполнения |
| sortOrder | Int | Порядок отображения характеристики |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.8 - Структура таблицы SpecificationOption

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор варианта значения характеристики |
| specificationId | String | Идентификатор характеристики |
| value | String | Значение варианта выбора |
| sortOrder | Int | Порядок отображения варианта |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.9 - Структура таблицы CategoryCollection

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор подборки категории |
| categoryId | String | Идентификатор категории |
| name | String | Наименование подборки |
| slug | String | Уникальный адрес подборки |
| conditions | Json | Условия формирования подборки |
| sortOrder | Int | Порядок отображения подборки |
| isActive | Boolean | Признак активности подборки |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.10 - Структура таблицы Brand

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор бренда |
| name | String | Наименование бренда |
| slug | String | Уникальный адрес бренда |
| description | String | Описание бренда |
| logo | String | Ссылка на логотип бренда |
| isActive | Boolean | Признак активности бренда |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.11 - Структура таблицы Product

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор товара |
| title | String | Наименование товара |
| slug | String | Уникальный адрес товара |
| sku | String | Артикул товара |
| shortDescription | String | Краткое описание товара |
| description | String | Полное описание товара |
| price | Decimal(10,2) | Текущая цена товара |
| oldPrice | Decimal(10,2) | Старая цена товара |
| stock | Int | Количество товара на складе |
| images | String[] | Список ссылок на изображения товара |
| specs | Json | Основные характеристики товара |
| additionalSpecs | Json | Дополнительные характеристики товара |
| isActive | Boolean | Признак активности товара |
| categoryId | String | Идентификатор категории товара |
| brandId | String | Идентификатор бренда товара |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.12 - Структура таблицы CartItem

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор позиции корзины |
| userId | String | Идентификатор пользователя |
| productId | String | Идентификатор товара |
| quantity | Int | Количество товара в корзине |
| isSelected | Boolean | Признак выбора позиции для оформления заказа |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.13 - Структура таблицы WishlistItem

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор записи избранного |
| userId | String | Идентификатор пользователя |
| productId | String | Идентификатор товара |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.14 - Структура таблицы Address

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор адреса |
| userId | String | Идентификатор пользователя |
| label | String | Название адреса |
| city | String | Город |
| street | String | Улица |
| house | String | Номер дома |
| apartment | String | Номер квартиры |
| zipCode | String | Почтовый индекс |
| isDefault | Boolean | Признак адреса по умолчанию |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.15 - Структура таблицы Review

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор отзыва |
| userId | String | Идентификатор пользователя |
| productId | String | Идентификатор товара |
| rating | Int | Оценка товара |
| comment | String | Текст отзыва |
| isActive | Boolean | Признак активности отзыва |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.16 - Структура таблицы PromoCode

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор промокода |
| code | String | Код промокода |
| description | String | Описание промокода |
| discountType | DiscountType | Тип скидки |
| value | Decimal(10,2) | Значение скидки |
| maxDiscount | Decimal(10,2) | Максимальная сумма скидки |
| minOrderTotal | Decimal(10,2) | Минимальная сумма заказа |
| usageLimit | Int | Ограничение количества использований |
| usedCount | Int | Количество использований |
| startsAt | DateTime | Дата начала действия промокода |
| endsAt | DateTime | Дата окончания действия промокода |
| isActive | Boolean | Признак активности промокода |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.17 - Структура таблицы DeliveryMethod

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор способа доставки |
| code | String | Системный код способа доставки |
| name | String | Наименование способа доставки |
| description | String | Описание способа доставки |
| scenario | DeliveryScenario | Сценарий доставки |
| price | Decimal(10,2) | Стоимость доставки |
| minOrderTotal | Decimal(10,2) | Минимальная сумма заказа для применения способа доставки |
| isActive | Boolean | Признак активности способа доставки |
| sortOrder | Int | Порядок отображения |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.18 - Структура таблицы PickupPoint

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор пункта получения |
| code | String | Системный код пункта получения |
| name | String | Наименование пункта получения |
| city | String | Город |
| address | String | Адрес пункта получения |
| type | PickupPointType | Тип пункта получения |
| isActive | Boolean | Признак активности пункта получения |
| sortOrder | Int | Порядок отображения |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.19 - Структура таблицы PaymentMethod

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор способа оплаты |
| code | String | Системный код способа оплаты |
| name | String | Наименование способа оплаты |
| description | String | Описание способа оплаты |
| isActive | Boolean | Признак активности способа оплаты |
| sortOrder | Int | Порядок отображения |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.20 - Структура таблицы HomeSlider

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор слайда главной страницы |
| kicker | String | Дополнительный короткий текст слайда |
| title | String | Заголовок слайда |
| description | String | Описание слайда |
| primaryText | String | Основной текст ссылки или действия |
| primaryLabel | String | Подпись основной кнопки |
| secondaryText | String | Дополнительный текст ссылки или действия |
| secondaryLabel | String | Подпись дополнительной кнопки |
| panelKicker | String | Дополнительный текст панели слайда |
| panelTitle | String | Заголовок панели слайда |
| panelDescription | String | Описание панели слайда |
| imageUrl | String | Ссылка на изображение слайда |
| isActive | Boolean | Признак активности слайда |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.21 - Структура таблицы Order

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор заказа |
| orderNumber | String | Номер заказа |
| userId | String | Идентификатор пользователя |
| status | OrderStatus | Текущий статус заказа |
| totalPrice | Decimal(10,2) | Итоговая стоимость заказа |
| discountAmount | Decimal(10,2) | Сумма скидки |
| promoCodeId | String | Идентификатор примененного промокода |
| promoCodeCode | String | Код примененного промокода |
| customerName | String | Имя покупателя |
| customerPhone | String | Телефон покупателя |
| customerEmail | String | Электронная почта покупателя |
| city | String | Город доставки |
| deliveryAddress | String | Адрес доставки |
| deliveryMethod | String | Код способа доставки |
| deliveryMethodName | String | Наименование способа доставки |
| deliveryPrice | Decimal(10,2) | Стоимость доставки |
| pickupPointId | String | Идентификатор пункта получения |
| pickupPointName | String | Наименование пункта получения |
| pickupPointAddress | String | Адрес пункта получения |
| recipientName | String | Имя получателя |
| pickupCity | String | Город пункта получения |
| pickupNumber | String | Номер пункта получения |
| paymentMethod | String | Код способа оплаты |
| paymentMethodName | String | Наименование способа оплаты |
| comment | String | Комментарий покупателя |
| adminComment | String | Комментарий администратора |
| createdAt | DateTime | Дата создания записи |
| updatedAt | DateTime | Дата последнего изменения записи |

Таблица В.22 - Структура таблицы OrderStatusHistory

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор записи истории статуса |
| orderId | String | Идентификатор заказа |
| fromStatus | OrderStatus | Предыдущий статус заказа |
| toStatus | OrderStatus | Новый статус заказа |
| adminComment | String | Комментарий администратора |
| createdAt | DateTime | Дата создания записи |

Таблица В.23 - Структура таблицы OrderItem

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор позиции заказа |
| orderId | String | Идентификатор заказа |
| productId | String | Идентификатор товара |
| quantity | Int | Количество товара |
| price | Decimal(10,2) | Цена товара на момент оформления заказа |

Таблица В.24 - Структура таблицы Notification

| Поле | Тип | Описание |
| --- | --- | --- |
| id | String | Идентификатор уведомления |
| userId | String | Идентификатор пользователя |
| type | NotificationType | Тип уведомления |
| title | String | Заголовок уведомления |
| message | String | Текст уведомления |
| isRead | Boolean | Признак прочтения уведомления |
| emailMockSent | Boolean | Признак формирования имитации отправки сообщения |
| emailMockPayload | Json | Данные имитации отправки сообщения |
| createdAt | DateTime | Дата создания записи |
| readAt | DateTime | Дата прочтения уведомления |
