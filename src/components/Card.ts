// src/components/Card.ts

import { Component } from './base/Component';
import { IProductItem } from '../types';
import { ensureElement } from '../utils/utils';
import { CDN_URL } from '../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

type CardRenderData = Partial<IProductItem> & { inBasket?: boolean };

const categoryClass: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'другое': 'card__category_other',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
};

export class Card extends Component<IProductItem> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _button?: HTMLButtonElement;
	protected _category?: HTMLElement;
	protected _price: HTMLElement;
	protected _description?: HTMLElement;
    protected _index?: HTMLElement;

    protected _isInBasket: boolean;
    protected _priceValue: number | null;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = container.querySelector('.card__image');
		this._button = container.querySelector('.card__button');
		this._category = container.querySelector('.card__category');
		this._price = ensureElement<HTMLElement>('.card__price', container);
        this._description = container.querySelector('.card__text');
        this._index = container.querySelector('.basket__item-index');

        if (actions?.onClick) {
			const targetElement = this._button || container;
			targetElement.addEventListener('click', actions.onClick);
		}
	}

    render(data?: CardRenderData): HTMLElement {
        if (data) {
            this.title = data.title;
            this.image = data.image;
            this.description = data.description;
            this.category = data.category;
            this.price = data.price; 
            if (data.inBasket !== undefined) {
                this.inBasket = data.inBasket; 
            }
        }
        return this.container;
    }
    
    protected updateButtonState() {
        if (this._button && this._description) {
            if (this._priceValue === null) {
                this.setText(this._button, 'Недоступно');
                this.setDisabled(this._button, true);
            } else {
                this.setText(this._button, this._isInBasket ? 'Удалить из корзины' : 'Купить');
                this.setDisabled(this._button, false);
            }
        }
    }

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
        this._priceValue = value;
        this.updateButtonState();
	}

	set inBasket(value: boolean) {
        this._isInBasket = value;
        this.updateButtonState();
	}
    
    set index(value: number) { this.setText(this._index, value); }
    set title(value: string) { this.setText(this._title, value); }
	set image(value: string) { if(this._image) this._image.src = CDN_URL + value; }
    set description(value: string) { this.setText(this._description, value); }
	set category(value: string) {
        if (this._category) {
            this.setText(this._category, value);
            Object.values(categoryClass).forEach(className => this._category.classList.remove(className));
            if (categoryClass[value]) {
                this._category.classList.add(categoryClass[value]);
            }
        }
	}
}