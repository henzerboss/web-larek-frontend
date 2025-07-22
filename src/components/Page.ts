import { Component } from './base/Component';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._counter = ensureElement<HTMLElement>('.header__basket-counter', this.container);
		this._catalog = ensureElement<HTMLElement>('.gallery', this.container);
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);
		this._basket = ensureElement<HTMLElement>('.header__basket', this.container);

		// Устанавливаем обработчик для открытия корзины
		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	// Устанавливаем значение счетчика на иконке корзины
	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	// Заполняет галерею карточками товаров
	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	// Блокирует прокрутку страницы (когда открыта модалка)
	set locked(value: boolean) {
		this.container.classList.toggle('page__wrapper_locked', value);
	}
}