import type { ValidationError } from "class-validator";

const fieldLabels: Record<string, string> = {
    accessToken: "токен доступа",
    addressId: "адрес",
    brandId: "бренд",
    brandSlug: "адрес бренда",
    categoryId: "категория",
    categorySlug: "адрес категории",
    city: "город",
    code: "код",
    comment: "комментарий",
    customerEmail: "email",
    customerName: "имя получателя",
    customerPhone: "телефон",
    deliveryAddress: "адрес доставки",
    deliveryCode: "способ доставки",
    description: "описание",
    discountType: "тип скидки",
    discountValue: "размер скидки",
    email: "email",
    endsAt: "дата окончания",
    firstName: "имя",
    groups: "группы",
    imageUrl: "изображение",
    isActive: "активность",
    isBlocked: "блокировка",
    isDefault: "основной адрес",
    isSelected: "выбор",
    label: "название",
    lastName: "фамилия",
    limit: "лимит",
    maxUses: "лимит использований",
    message: "сообщение",
    minOrderTotal: "минимальная сумма заказа",
    name: "название",
    options: "варианты",
    order: "порядок",
    parentId: "родительская категория",
    password: "пароль",
    paymentCode: "способ оплаты",
    phone: "телефон",
    pickupCity: "город пункта выдачи",
    pickupNumber: "номер пункта выдачи",
    price: "цена",
    productId: "товар",
    productIds: "товары",
    quantity: "количество",
    rating: "оценка",
    role: "роль",
    scenario: "сценарий",
    search: "поиск",
    sku: "артикул",
    slug: "адрес страницы",
    sort: "сортировка",
    specs: "характеристики",
    startsAt: "дата начала",
    stock: "остаток",
    title: "заголовок",
    type: "тип",
    usageLimit: "лимит использований",
    value: "значение",
};

const messageTranslations = new Map<string, string>([
    ["Access denied", "Доступ запрещён"],
    ["Access token is invalid or expired", "Токен доступа недействителен или истёк"],
    ["Access token is missing", "Токен доступа отсутствует"],
    ["Address not found", "Адрес не найден"],
    ["Additional spec label is required", "Укажите название дополнительной характеристики"],
    ["Additional spec value is required", "Укажите значение дополнительной характеристики"],
    ["Admin cannot delete own account", "Администратор не может удалить собственный аккаунт"],
    ["All products must exist and be active", "Все товары должны существовать и быть активными"],
    ["Blocked user cannot create orders", "Заблокированный пользователь не может создавать заказы"],
    ["Blocked user cannot create reviews", "Заблокированный пользователь не может оставлять отзывы"],
    ["Brand not found", "Бренд не найден"],
    ["Brand slug already exists", "Адрес страницы бренда уже существует"],
    ["CSV file is empty", "CSV-файл пуст"],
    ["CSV file is required", "Загрузите CSV-файл"],
    ["Cancelled order cannot be moved to another status", "Отменённый заказ нельзя перевести в другой статус"],
    ["Cart is empty", "Корзина пуста"],
    ["Cart item not found", "Позиция корзины не найдена"],
    ["Category cannot be parent of itself", "Категория не может быть родителем самой себя"],
    ["Category collection not found", "Подборка категории не найдена"],
    ["Category not found", "Категория не найдена"],
    ["Category slug already exists", "Адрес страницы категории уже существует"],
    ["Category tree cannot be deeper than 3 levels", "Дерево категорий не может быть глубже 3 уровней"],
    ["Collections are available only for second-level categories", "Подборки доступны только для категорий второго уровня"],
    ["Delivery method code already exists", "Код способа доставки уже существует"],
    ["Delivery method is not available", "Способ доставки недоступен"],
    ["Delivery method not found", "Способ доставки не найден"],
    ["Google OAuth is not configured", "Вход через Google не настроен"],
    ["Google OAuth token exchange failed", "Не удалось получить токен Google"],
    ["Google account did not provide email", "Аккаунт Google не передал email"],
    ["Google account email is not verified", "Email аккаунта Google не подтверждён"],
    ["Google authorization code is missing", "Код авторизации Google отсутствует"],
    ["Image file is required", "Загрузите изображение"],
    ["Image size must not exceed 5 MB", "Размер изображения не должен превышать 5 МБ"],
    ["Invalid OAuth state", "Недействительное состояние OAuth"],
    ["Invalid email or password", "Неверный email или пароль"],
    ["Invalid upload type", "Недопустимый тип загрузки"],
    ["Notification not found", "Уведомление не найдено"],
    ["Only CSV files are allowed", "Можно загружать только CSV-файлы"],
    ["Only jpeg, png, webp and gif images are allowed", "Можно загружать только изображения jpeg, png, webp и gif"],
    ["Order not found", "Заказ не найден"],
    ["Order total is too low for this delivery method", "Сумма заказа слишком мала для этого способа доставки"],
    ["Order total is too low for this promo code", "Сумма заказа слишком мала для этого промокода"],
    ["Payment method code already exists", "Код способа оплаты уже существует"],
    ["Payment method is not available", "Способ оплаты недоступен"],
    ["Payment method not found", "Способ оплаты не найден"],
    ["Percent discount must not exceed 100", "Скидка в процентах не может превышать 100"],
    ["Pickup point is not available", "Пункт выдачи недоступен"],
    ["Pickup point is not available for courier delivery", "Пункт выдачи недоступен для курьерской доставки"],
    ["Pickup point must be provided", "Укажите пункт выдачи"],
    ["Product is not available", "Товар недоступен"],
    ["Product is out of stock", "Товара нет в наличии"],
    ["Product not found", "Товар не найден"],
    ["Products must belong to the same category", "Товары должны относиться к одной категории"],
    ["Promo code already exists", "Промокод уже существует"],
    ["Promo code has expired", "Срок действия промокода истёк"],
    ["Promo code is inactive", "Промокод неактивен"],
    ["Promo code is invalid", "Промокод недействителен"],
    ["Promo code is not active yet", "Промокод ещё не активен"],
    ["Promo code not found", "Промокод не найден"],
    ["Promo code usage limit has been reached", "Лимит использований промокода исчерпан"],
    ["Recipient name, pickup city and pickup number must be provided", "Укажите получателя, город и номер пункта выдачи"],
    ["Refresh token is invalid or expired", "Сессия недействительна или истекла"],
    ["Refresh token is missing", "Сессия отсутствует"],
    ["Requested quantity exceeds product stock", "Запрошенное количество превышает остаток товара"],
    ["Review not found", "Отзыв не найден"],
    ["Select specification requires at least one option", "Для характеристики с выбором нужен хотя бы один вариант"],
    ["Specification does not belong to this template", "Характеристика не относится к этому шаблону"],
    ["Specification group does not belong to this template", "Группа характеристик не относится к этому шаблону"],
    ["Specification group name is required", "Укажите название группы характеристик"],
    ["Specification name is required", "Укажите название характеристики"],
    ["Specification option does not belong to this template", "Вариант характеристики не относится к этому шаблону"],
    ["Specification options cannot be empty", "Список вариантов характеристики не может быть пустым"],
    ["Specification template already exists for this category", "Для этой категории уже есть шаблон характеристик"],
    ["Specification template name is required", "Укажите название шаблона характеристик"],
    ["Specification template not found", "Шаблон характеристик не найден"],
    ["Too many requests, please try again later", "Слишком много запросов. Попробуйте позже"],
    ["User email already exists", "Пользователь с таким email уже существует"],
    ["User has already reviewed this product", "Вы уже оставляли отзыв на этот товар"],
    ["User is blocked", "Аккаунт заблокирован"],
    ["User is not available", "Пользователь недоступен"],
    ["User not found", "Пользователь не найден"],
    ["User with orders cannot be deleted", "Пользователя с заказами нельзя удалить"],
    ["VK OAuth is not configured", "Вход через VK не настроен"],
    ["VK account did not provide email", "Аккаунт VK не передал email"],
    ["You cannot delete this review", "Вы не можете удалить этот отзыв"],
    ["Either addressId or city and deliveryAddress must be provided", "Укажите адрес из профиля или город и адрес доставки"],
    ["startsAt must be earlier than endsAt", "Дата начала должна быть раньше даты окончания"],
]);

const errorTranslations = new Map<string, string>([
    ["Bad Request", "Некорректный запрос"],
    ["Conflict", "Конфликт данных"],
    ["Forbidden", "Доступ запрещён"],
    ["Not Found", "Не найдено"],
    ["Service Unavailable", "Сервис временно недоступен"],
    ["Too Many Requests", "Слишком много запросов"],
    ["Unauthorized", "Требуется авторизация"],
]);

function labelFor(property: string) {
    return fieldLabels[property] ?? property;
}

function extractNumber(message: string | undefined) {
    return message?.match(/\d+(?:\.\d+)?/)?.[0];
}

function localizeConstraint(property: string, constraint: string, defaultMessage: string | undefined) {
    const label = labelFor(property);
    const value = extractNumber(defaultMessage);

    if (constraint === "whitelistValidation") {
        return `Поле «${label}» не разрешено.`;
    }

    if (constraint === "isEmail") {
        return `Поле «${label}» должно быть корректным email.`;
    }

    if (constraint === "isString") {
        return `Поле «${label}» должно быть строкой.`;
    }

    if (constraint === "isBoolean") {
        return `Поле «${label}» должно быть true или false.`;
    }

    if (constraint === "isInt") {
        return `Поле «${label}» должно быть целым числом.`;
    }

    if (constraint === "isNumber") {
        return `Поле «${label}» должно быть числом.`;
    }

    if (constraint === "isArray") {
        return `Поле «${label}» должно быть списком.`;
    }

    if (constraint === "isObject") {
        return `Поле «${label}» должно быть объектом.`;
    }

    if (constraint === "isEnum") {
        return `Поле «${label}» содержит недопустимое значение.`;
    }

    if (constraint === "isDate") {
        return `Поле «${label}» должно быть датой.`;
    }

    if (constraint === "isIn") {
        return `Поле «${label}» содержит недопустимое значение.`;
    }

    if (constraint === "minLength") {
        return value ? `Поле «${label}» должно быть не короче ${value} символов.` : `Поле «${label}» слишком короткое.`;
    }

    if (constraint === "maxLength") {
        return value ? `Поле «${label}» должно быть не длиннее ${value} символов.` : `Поле «${label}» слишком длинное.`;
    }

    if (constraint === "min") {
        return value ? `Поле «${label}» должно быть не меньше ${value}.` : `Поле «${label}» слишком маленькое.`;
    }

    if (constraint === "max") {
        return value ? `Поле «${label}» должно быть не больше ${value}.` : `Поле «${label}» слишком большое.`;
    }

    if (constraint === "arrayNotEmpty" || constraint === "arrayMinSize") {
        return `Поле «${label}» не должно быть пустым.`;
    }

    if (constraint === "arrayMaxSize") {
        return value ? `Поле «${label}» должно содержать не больше ${value} элементов.` : `Поле «${label}» содержит слишком много элементов.`;
    }

    if (constraint === "arrayUnique") {
        return `Поле «${label}» не должно содержать повторы.`;
    }

    if (constraint === "nestedValidation") {
        return `Поле «${label}» заполнено некорректно.`;
    }

    return defaultMessage ? localizeErrorMessage(defaultMessage) : `Поле «${label}» заполнено некорректно.`;
}

export function localizeValidationErrors(errors: ValidationError[]) {
    const messages: string[] = [];

    const visit = (error: ValidationError) => {
        if (error.constraints) {
            Object.entries(error.constraints).forEach(([constraint, message]) => {
                messages.push(localizeConstraint(error.property, constraint, message));
            });
        }

        error.children?.forEach(visit);
    };

    errors.forEach(visit);

    return messages.length ? messages : ["Проверьте корректность заполненных данных."];
}

export function localizeErrorMessage(message: string) {
    if (messageTranslations.has(message)) {
        return messageTranslations.get(message) as string;
    }

    if (errorTranslations.has(message)) {
        return errorTranslations.get(message) as string;
    }

    const productUnavailable = message.match(/^Product is not available: (.+)$/);
    if (productUnavailable) {
        return `Товар недоступен: ${productUnavailable[1]}`;
    }

    const notEnoughStock = message.match(/^Not enough stock for product: (.+)$/);
    if (notEnoughStock) {
        return `Недостаточно товара на складе: ${notEnoughStock[1]}`;
    }

    const unknownSpec = message.match(/^Unknown spec key: (.+)$/);
    if (unknownSpec) {
        return `Неизвестная характеристика: ${unknownSpec[1]}`;
    }

    const requiredSpec = message.match(/^Required spec is missing: (.+)$/);
    if (requiredSpec) {
        return `Заполните обязательную характеристику: ${requiredSpec[1]}`;
    }

    const specMustBe = message.match(/^Spec (.+) must be a (string|number|boolean)$/);
    if (specMustBe) {
        const typeLabel = specMustBe[2] === "string" ? "строкой" : specMustBe[2] === "number" ? "числом" : "значением true или false";
        return `Характеристика «${specMustBe[1]}» должна быть ${typeLabel}.`;
    }

    const specOptions = message.match(/^Spec (.+) must use one of the configured options$/);
    if (specOptions) {
        return `Характеристика «${specOptions[1]}» должна использовать один из настроенных вариантов.`;
    }

    const missingRequiredField = message.match(/^Missing required field: (.+)$/);
    if (missingRequiredField) {
        return `Заполните обязательное поле: ${missingRequiredField[1]}`;
    }

    const categoryBySlug = message.match(/^Category not found by slug: (.+)$/);
    if (categoryBySlug) {
        return `Категория с адресом «${categoryBySlug[1]}» не найдена.`;
    }

    const brandBySlug = message.match(/^Brand not found by slug: (.+)$/);
    if (brandBySlug) {
        return `Бренд с адресом «${brandBySlug[1]}» не найден.`;
    }

    const positiveNumber = message.match(/^(.+) must be a positive number$/);
    if (positiveNumber) {
        return `Поле «${positiveNumber[1]}» должно быть положительным числом.`;
    }

    const nonNegativeInteger = message.match(/^(.+) must be a non-negative integer$/);
    if (nonNegativeInteger) {
        return `Поле «${nonNegativeInteger[1]}» должно быть неотрицательным целым числом.`;
    }

    return message;
}

export function localizeErrorMessages(message: string | string[]) {
    return Array.isArray(message) ? message.map(localizeErrorMessage) : localizeErrorMessage(message);
}
