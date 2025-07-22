import { Component } from './base/Component';
import { IEvents } from './base/events';
import { ensureElement } from '../utils/utils';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
		this._content = ensureElement<HTMLElement>('.modal__content', this.container);

		// Обработчики закрытия окна
		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('mousedown', (evt) => {
			if (evt.target === evt.currentTarget) {
				this.close();
			}
		});
		this.handleEscUp = this.handleEscUp.bind(this);
	}

	// Обработчик нажатия на Escape для закрытия модалки
	protected handleEscUp(evt: KeyboardEvent): void {
		if (evt.key === 'Escape') {
			this.close();
		}
	}

	// Устанавливает контент, который будет показан в модалке
	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open(): void {
		this.container.classList.add('modal_active');
		document.addEventListener('keyup', this.handleEscUp);
		this.events.emit('modal:open');
	}

	close(): void {
		this.container.classList.remove('modal_active');
		this.content = null; // Очищаем содержимое
		document.removeEventListener('keyup', this.handleEscUp);
		this.events.emit('modal:close');
	}
}