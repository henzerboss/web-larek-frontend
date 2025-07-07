# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack
Парадигма: MVP (Model - View - Presenter)  
Архитектура: событийно-ориентированная

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

##Данные и типы данных, используемые в приложении

Интерфейс карточки товара

```
interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null; // null для бесценного товара (Мамки-таймера)
}
```

Интерфейс заказа
```
interface IOrder {
    payment: 'card' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}
```

Модель, отвечающая за данные о товарах
```
interface IProductModel {
    catalog: IProductItem[]; // Хранит все товары
    preview: string | null;  // ID товара для предпросмотра

    setCatalog(items: IProductItem[]): void;
    setPreview(item: IProductItem): void;
    findItem(id: string): IProductItem | undefined; // Находит товар по ID
}
```

Модель, отвечающая за корзину и заказ
```
interface IBasketModel {
    items: IProductItem[]; // Товары в корзине
    order: IOrder;         // Данные заказа

    addToBasket(item: IProductItem): void;
    removeFromBasket(item: IProductItem): void;
    clearBasket(): void;
    getTotal(): number;
    
    setOrderField(field: keyof Omit<IOrder, 'items' | 'total'>, value: string): void;
    validateOrder(): boolean;
    validateContacts(): boolean;
}
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- Слой данных (Model), отвечает за хранение, изменение и валидацию данных, 
- Слой представления (View), отвечает за отображение данных на странице и обработку действий пользователя
- Слой API, отвечает за взаимодействие с сервером
- Презентер (Presenter), связывает все слои между собой. Его роль выполняет код в src/index.ts

Используется событийно-ориентированный подход. Для обмена событиями между слоями используется брокер событий (EventEmitter).

### Базовый код

#### Класс Api
Содержит базовую логику отправки запросов к серверу. В конструктор передается базовый адрес сервера и, опционально, заголовки.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события 

### Слой данных

#### Класс ProductModel
Отвечает за хранение и управление списком всех товаров.

Конструктор принимает экземпляр EventEmitter.

Поля:

- `catalog: IProductItem[]`: массив всех товаров, полученных с сервера.
- `preview: string | null`: ID товара, выбранного для детального просмотра.

Методы:

- `setCatalog(items: IProductItem[]): void`: сохраняет список товаров и генерирует событие items:changed.
- `setPreview(item: IProductItem): void`: сохраняет ID товара для превью.
- `getCatalog(): IProductItem[]`: возвращает массив всех товаров.
- `findItem(id: string): IProductItem | undefined`: находит и возвращает товар из каталога по его ID.

#### Класс BasketModel
Отвечает за состояние корзины и процесс оформления заказа.

Конструктор принимает экземпляр EventEmitter.

Поля:

- `items: IProductItem[]`: массив товаров, добавленных в корзину.
- `order: IOrder`: объект с данными для оформления заказа (адрес, оплата, контакты).

Методы:

- `addToBasket(item: IProductItem): void`: добавляет товар в корзину. Генерирует событие basket:changed.
- `removeFromBasket(itemId: string): void`: удаляет товар из корзины. Генерирует событие basket:changed.
- `getBasketItems(): IProductItem[]`: возвращает массив товаров в корзине.
- `getTotal(): number`: возвращает общую стоимость товаров в корзине.
- `clearBasket(): void`: очищает корзину.
- `isItemInBasket(itemId: string): boolean`: проверяет, есть ли товар в корзине.
- `setOrderField(field: keyof IOrderForm, value: string): void`: сохраняет данные из полей форм в объект order.
- `validateOrder(): boolean / validateContacts(): boolean`: проверяют валидность данных в форме заказа.
- `createOrderPayload(): IOrder`: собирает финальный объект заказа.


### Классы представления

#### Класс Page
Управляет отображением элементов на главной странице.

Назначение: Отображает каталог товаров в контейнере .gallery, обновляет счетчик .header__basket-counter.

Конструктор:

- `container: HTMLElement`: Основной DOM-элемент страницы, внутри которого класс найдет .gallery и .header__basket-counter.
- `events: IEvents`: Брокер событий для генерации события basket:open при клике на иконку.

Поля:

- `_counter: HTMLElement` для счетчика товаров в корзине (.header__basket-counter).
- `_catalog: HTMLElement` для контейнера карточек товаров (.gallery).
- `_wrapper: HTMLElement` для обертки страницы (.page__wrapper), чтобы блокировать скролл.

Методы:

- `set counter(value: number): void`: Устанавливает значение счетчика.
- `set catalog(items: HTMLElement[]): void`: Отображает массив карточек в каталоге.

#### Класс Modal
Для управления модальными окнами.

Назначение: Отвечает за открытие и закрытие модального окна и его оверлея. Показывает внутри себя любой контент, который ему передадут.

Конструктор: 

- `container: HTMLElement`: DOM-элемент модального окна  (#modal-container).
- `events: IEvents`: Брокер событий для генерации modal:close при закрытии.

Поля:

- `_content: HTMLElement` для вставки контента в модальное окно (.modal__content).
- `_closeButton: HTMLButtonElement` для закрытия окна.

Методы:

- `open(): void`: Открывает модальное окно.
- `close(): void`: Закрывает модальное окно.
- `set content(node: HTMLElement): void`: Устанавливает контент модального окна.

#### Класс Card
Отвечает за отображение одной карточки товара.
Назначение: Создает DOM-элемент карточки по шаблону и заполняет его данными. Может создавать разные представления одного и того же товара (для каталога, превью или корзины), используя соответствующие шаблоны (#card-catalog, #card-preview, #card-basket). Управляет состоянием кнопки ("Купить" / "Удалить из корзины" / "Недоступно").

Назначение: Создает DOM-элемент карточки по шаблону и заполняет его данными.

Конструктор:

- `template: HTMLTemplateElement`: Шаблон для клонирования карточки. В зависимости от контекста используется #card-catalog, #card-preview или #card-basket.
- `actions: { onClick: (event: MouseEvent) => void; })`:  Объект с обработчиками кликов.

Поля:

- `_title: HTMLElement` для названия товара.
- `_image: HTMLImageElement` для изображения.
- `_price: HTMLElement` для цены.
- `_category: HTMLElement` для категории.
- `_description: HTMLElement` для описания (в детальном виде).
- `_button: HTMLButtonElement` для кнопки действия.

Методы:

- `render(data: IProductItem & { inBasket: boolean }): HTMLElement`: Заполняет шаблон данными и возвращает готовый DOM-элемент карточки. Устанавливает текст и состояние кнопки в зависимости от цены и наличия товара в корзине.

#### Класс Basket
Отвечает за отображение содержимого корзины.

Назначение: Создает список товаров в корзине из шаблонов #card-basket. Отображает итоговую сумму. Может отображать сообщение "Корзина пуста". Управляет активностью кнопки "Оформить".

Конструктор:

- `template: HTMLTemplateElement`: Шаблон для клонирования всего блока корзины #basket.
- `events: IEvents`: Брокер событий для генерации order:open.

Поля:

- `_list: HTMLElement` для списка товаров в корзине (.basket__list).
- `_total: HTMLElement` для итоговой цены.
- `_button: HTMLButtonElement` для кнопки "Оформить".

Методы:

- `set items(items: HTMLElement[]): void`: Отображает массив карточек товаров в списке.
- `set total(price: number): void`: Устанавливает итоговую цену.
- `setDisabled(value: boolean): void`: Управляет активностью кнопки "Оформить".

#### Классы Order и Contacts
Отвечают за формы оформления заказа.

Назначение: Управляют полями ввода и кнопками. Собирают введенные данные. Отображают ошибки валидации в элементе .form__errors. Создают контент для класса Modal, используя шаблоны #order и #contacts.

Конструктор:

- `template: HTMLTemplateElement`: Шаблон формы (#order или #contacts соответственно).
- `events: IEvents`: Брокер событий для генерации input и submit событий.

Поля:

- `_form: HTMLFormElement` - сам элемент формы.
- `_submitButton: HTMLButtonElement` для отправки формы.
- `_errors: HTMLElement` для вывода текста ошибок (.form__errors).

Методы:

- `render(state: { valid: boolean; errors: string[] }): HTMLFormElement`: Заполняет форму данными и устанавливает состояние валидности.
- `set valid(state: boolean): void`: Управляет активностью кнопки "submit".
- `set errors(text: string): void`: Устанавливает текст ошибки валидации.

#### Класс Success
Отвечает за отображение сообщения об успешном заказе.

Назначение: Показывает итоговую сумму и кнопку "За новыми покупками". Его контент также отображается в Modal. Использует шаблон #success.

Конструктор: 

- `template: HTMLTemplateElement`: Шаблон #success для сообщения об успехе.
- `actions: { onClose: () => void; })`: Обработчик для клика по кнопке "За новыми покупками".

Поля:

- `_total: HTMLElement` для отображения списанной суммы.
- `_closeButton: HTMLButtonElement` для кнопки "За новыми покупками".

Методы:

- `render(data: { total: number }): HTMLElement`: Заполняет шаблон данными об итоговой сумме и возвращает DOM-элемент.

### Слой коммуникации

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов

Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

Список событий

- `items:changed`: (от ProductModel) каталог товаров загружен.
- `card:select`: (от View Card) пользователь кликнул на карточку для просмотра.
- `preview:changed`: (от ProductModel) изменился товар для превью.
- `basket:changed`: (от BasketModel) изменился состав или сумма корзины.
- `basket:open`: (от View) пользователь нажал на иконку корзины.
- `order:open`: (от View Basket) пользователь нажал "Оформить" в корзине.
- `payment:change`: (от View Order) пользователь выбрал способ оплаты.
- `order:input`: (от View Order) изменились данные в форме адреса.
- `order:submit`: (от View Order) пользователь отправил форму с адресом.
- `contacts:input`: (от View Contacts) изменились данные в форме контактов.
- `contacts:submit`: (от View Contacts) пользователь отправил форму с контактами.
- `modal:open/modal:close`: открытие/закрытие модального окна.

## Пример взаимодействия: Добавление товара в корзину

1. View: Пользователь кликает на кнопку "Купить" в модальном окне превью. Класс Card генерирует событие, передавая в него ID товара.

2. Presenter: index.ts слушает событие. Он находит товар в productModel (productModel.findItem(id)) и передает его в basketModel.addToBasket(item).

3. Model: BasketModel добавляет товар в свой массив items и генерирует событие basket:changed.

4. Presenter: index.ts слушает basket:changed. Он запрашивает у basketModel новую сумму и количество товаров и передает их в Page для обновления счетчика. Также он закрывает модальное окно.

5. View: Класс Page обновляет текст в счетчике на иконке корзины. Пользователь видит результат.