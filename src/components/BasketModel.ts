import { IProductItem, IOrder, IBasketModel, TOrderForm } from '../types';
import { IEvents } from './base/events';

export class BasketModel implements IBasketModel {
	protected _items: IProductItem[] = [];
	protected _order: IOrder = {
		payment: '',
		email: '',
		phone: '',
		address: '',
		total: 0,
		items: [],
	};

	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	addToBasket(item: IProductItem): void {
		this._items.push(item);
		this.events.emit('basket:changed');
	}

	removeFromBasket(itemId: string): void {
		this._items = this._items.filter((item) => item.id !== itemId);
		this.events.emit('basket:changed');
	}

	isItemInBasket(itemId: string): boolean {
		return this._items.some((item) => item.id === itemId);
	}

    getOrder(): IOrder {
        return this._order;
    }

	clearBasket(): void {
		this._items = [];
		this._order = {
			payment: '', 
			email: '',
			phone: '',
			address: '',
			total: 0,
			items: [],
		};
		this.events.emit('basket:changed');
	}

	getBasketItems(): IProductItem[] {
		return this._items;
	}

	getTotal(): number {
		return this._items.reduce((sum, item) => sum + (item.price || 0), 0);
	}

    validateOrder(): string {
        if (!this._order.payment) return 'Необходимо выбрать способ оплаты';
        if (!this._order.address) return 'Необходимо указать адрес';
        return ''; 
    }

    validateContacts(): string {
        if (!this._order.email) return 'Необходимо указать email';
        if (!this._order.phone) return 'Необходимо указать телефон';
        return ''; 
    }

    setOrderField(field: keyof TOrderForm, value: string): void {
        this._order[field] = value;
    }

	createOrderPayload(): IOrder {
		this._order.total = this.getTotal();
		this._order.items = this._items.map((item) => item.id);
		return this._order;
	}
}