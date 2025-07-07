export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IOrder {
    payment: 'card' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export type TOrderForm = Pick<IOrder, 'payment' | 'address' | 'email' | 'phone'>;

export interface IProductModel {
    catalog: IProductItem[];
    preview: string | null;

    setCatalog(items: IProductItem[]): void;
    setPreview(item: IProductItem): void;
    getCatalog(): IProductItem[];
    findItem(id: string): IProductItem | undefined;
}

export interface IBasketModel {
    items: IProductItem[];
    order: IOrder;

    addToBasket(item: IProductItem): void;
    removeFromBasket(itemId: string): void;
    clearBasket(): void;
    getBasketItems(): IProductItem[];
    getTotal(): number;
    isItemInBasket(itemId: string): boolean;
    setOrderField(field: keyof TOrderForm, value: string): void;
    validateOrder(): boolean;
    validateContacts(): boolean;
    createOrderPayload(): IOrder;
}
