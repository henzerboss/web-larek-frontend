import { IProductItem, IProductModel } from '../types';
import { IEvents } from './base/events';

export class ProductModel implements IProductModel {
    protected _catalog: IProductItem[];
    protected _preview: string | null = null;
    protected events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
        this._catalog = [];
    }

    setCatalog(items: IProductItem[]): void {
        this._catalog = items;
        this.events.emit('items:changed', { catalog: this._catalog });
    }

    setPreview(item: IProductItem): void {
        this._preview = item.id;
        this.events.emit('preview:changed', item);
    }

    getCatalog(): IProductItem[] {
        return this._catalog;
    }

    getPreviewId(): string | null {
        return this._preview;
    }

    findItem(id: string): IProductItem | undefined {
        return this._catalog.find((item) => item.id === id);
    }
}