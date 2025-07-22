import { Form } from './base/Form';
import { IEvents } from './base/events';
import { TOrderForm } from '../types';

// Наследуем все от базового класса Form
export class Contacts extends Form<TOrderForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}
}