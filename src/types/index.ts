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
	setCatalog(items: IProductItem[]): void;
	setPreview(item: IProductItem): void;
	getCatalog(): IProductItem[];
	getPreviewId(): string | null;
	findItem(id: string): IProductItem | undefined;
}

export interface IBasketModel {
	addToBasket(item: IProductItem): void;
	removeFromBasket(itemId: string): void;
	clearBasket(): void;
	getBasketItems(): IProductItem[];
	getTotal(): number;
	isItemInBasket(itemId: string): boolean;
}

export interface IOrderModel {
    order: TOrderForm;
    getOrderData(): TOrderForm;
	setOrderField(field: keyof TOrderForm, value: string): void;
	validateOrder(): string;
	validateContacts(): string;
    clearOrder(): void;
}

export interface IApi {
    getProductList: () => Promise<IProductItem[]>;
    createOrder: (order: IOrder) => Promise<IOrderResult>;
}