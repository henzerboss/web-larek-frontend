export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IOrder {
    payment: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export interface IOrderResult {
    id: string;
    total: number;
}

export type TOrderForm = Pick<IOrder, 'payment' | 'address' | 'email' | 'phone'>;

export interface IProductModel {
    //catalog: IProductItem[];  убрал, так как это protected свойство
    //preview: string | null;  убрал, так как это protected свойство

    setCatalog(items: IProductItem[]): void;
    setPreview(item: IProductItem): void;
    getCatalog(): IProductItem[]; //добавил геттер вместо публичного свойства
    getPreviewId(): string | null;  //добавил геттер вместо публичного свойства
    findItem(id: string): IProductItem | undefined;
}

export interface IBasketModel {
    //items: IProductItem[];  убрал, так как это protected свойство
    //order: IOrder;  убрал, так как это protected свойство

    addToBasket(item: IProductItem): void;
    removeFromBasket(itemId: string): void;
    clearBasket(): void;
    getBasketItems(): IProductItem[];
    getTotal(): number;
    isItemInBasket(itemId: string): boolean;
    getOrder(): IOrder; //добавил геттер вместо публичного свойства
    setOrderField(field: keyof TOrderForm, value: string): void; // установка значения поля в данных заказа
    validateOrder(): string; // изменил boolean на string, чтобы возвращать текст ошибки а не ее наличие
    validateContacts(): string; // изменил boolean на string, чтобы возвращать текст ошибки а не ее наличие
    createOrderPayload(): IOrder; // создаем объект заказа для отправки на сервер
}

export interface IApi {
    getProductList: () => Promise<IProductItem[]>;
    createOrder: (order: IOrder) => Promise<IOrderResult>;
}