import { IProductItem, IBasketModel } from '../types';
import { IEvents } from './base/events';

export class BasketModel implements IBasketModel {
	protected _items: IProductItem[] = [];

	constructor(protected events: IEvents) {}

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

	clearBasket(): void {
		this._items = [];
		this.events.emit('basket:changed');
	}

	getBasketItems(): IProductItem[] {
		return this._items;
	}

	getTotal(): number {
		return this._items.reduce((sum, item) => sum + (item.price || 0), 0);
	}
}