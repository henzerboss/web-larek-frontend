import { Form } from './base/Form';
import { IEvents } from './base/events';
import { TOrderForm } from '../types';

export class Order extends Form<TOrderForm> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;
	
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		
		this._cardButton = container.querySelector('button[name="card"]');
		this._cashButton = container.querySelector('button[name="cash"]');

		if (this._cardButton) {
			this._cardButton.addEventListener('click', () => {
				this.selectPayment('card');
			});
		}
		if (this._cashButton) {
			this._cashButton.addEventListener('click', () => {
				this.selectPayment('cash');
			});
		}
	}
    
    // Управляет выделением кнопок оплаты
    selectPayment(method: string) {
        this.container.querySelector('button[name="card"]').classList.toggle('button_alt-active', method === 'card');
        this.container.querySelector('button[name="cash"]').classList.toggle('button_alt-active', method === 'cash');
		this.events.emit('payment:change', { method });
	}
}