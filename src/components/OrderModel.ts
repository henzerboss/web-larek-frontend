import { IOrderModel, TOrderForm } from '../types';
import { IEvents } from './base/events';

export class OrderModel implements IOrderModel {
	order: TOrderForm = {
		payment: '',
		email: '',
		phone: '',
		address: '',
	};

	constructor(protected events: IEvents) {}
    
    getOrderData(): TOrderForm {
        return this.order;
    }

	setOrderField(field: keyof TOrderForm, value: string): void {
		this.order[field] = value;
	}

	validateOrder(): string {
		if (!this.order.payment) return 'Необходимо выбрать способ оплаты';
		if (!this.order.address) return 'Необходимо указать адрес';
		return '';
	}

	validateContacts(): string {
		if (!this.order.email) return 'Необходимо указать email';
		if (!this.order.phone) return 'Необходимо указать телефон';
		return '';
	}
    
    clearOrder(): void {
        this.order = {
            payment: '',
            email: '',
            phone: '',
            address: '',
        };
    }
}