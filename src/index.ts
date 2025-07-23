import './scss/styles.scss';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { AppApi } from './components/AppApi';
import { ProductModel } from './components/ProductModel';
import { BasketModel } from './components/BasketModel';
import { Page } from './components/Page';
import { Modal } from './components/Modal';
import { Card } from './components/Card';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IOrder, TOrderForm, IProductItem } from './types';
import { OrderModel } from './components/OrderModel';


// Брокер событий
const events = new EventEmitter();

// Базовый класс API
const api = new Api(API_URL);
// API нашего приложения
const appApi = new AppApi(api);

// Модели данных
const productModel = new ProductModel(events);
const basketModel = new BasketModel(events);
const orderModel = new OrderModel(events);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');


// Компоненты представления
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Компоненты для контента модалки
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => {
        modal.close();
    }
});

// Блокировка/разблокировка страницы
events.on('modal:open', () => { page.locked = true; });
events.on('modal:close', () => { page.locked = false; });

// Отрисовка каталога
events.on('items:changed', () => {
    page.catalog = productModel.getCatalog().map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render(item);
    });
});

// Выбор карточки
events.on('card:select', (item: IProductItem) => {
    productModel.setPreview(item);
});

// Открытие превью
events.on('preview:changed', (item: IProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (basketModel.isItemInBasket(item.id)) {
                basketModel.removeFromBasket(item.id);
                card.inBasket = false; 
            } else {
                basketModel.addToBasket(item);
                card.inBasket = true;
            }
        }
    });

    modal.render({
        content: card.render({
            ...item,
            inBasket: basketModel.isItemInBasket(item.id)
        })
    });
    
    modal.open();
});

// Изменение корзины
events.on('basket:changed', () => {
    page.counter = basketModel.getBasketItems().length;

    const basketItems = basketModel.getBasketItems().map((item, index) => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => basketModel.removeFromBasket(item.id)
        });
        card.index = index + 1;
        return card.render(item);
    });

    basket.items = basketItems;
    basket.total = basketModel.getTotal();
});

// Открытие корзины
events.on('basket:open', () => {
    modal.render({ content: basket.render() });
    modal.open();
});

// Открытие формы заказа (шаг 1)
events.on('order:open', () => {
    const currentOrderData = orderModel.getOrderData();
    modal.render({
        content: order.render({
            ...currentOrderData,
            valid: !orderModel.validateOrder(),
            errors: orderModel.validateOrder() || ''
        })
    });
    order.selectPayment(currentOrderData.payment);
});

// Обработчики ввода в формах
function handleOrderFormChange() {
    order.valid = !orderModel.validateOrder();
    order.errors = orderModel.validateOrder() || '';
}
function handleContactsFormChange() {
    contacts.valid = !orderModel.validateContacts();
    contacts.errors = orderModel.validateContacts() || '';
}

events.on('order:input', (data: { field: keyof TOrderForm, value: string }) => {
    orderModel.setOrderField(data.field, data.value);
    handleOrderFormChange();
});
events.on('payment:change', (data: { method: string }) => {
    orderModel.setOrderField('payment', data.method);
    handleOrderFormChange();
});

// Переход ко второй форме
events.on('order:submit', () => {
    const currentOrderData = orderModel.getOrderData();
    modal.render({
        content: contacts.render({
            ...currentOrderData,
            valid: !orderModel.validateContacts(),
            errors: orderModel.validateContacts() || ''
        })
    });
});

events.on('contacts:input', (data: { field: keyof TOrderForm, value: string }) => {
    orderModel.setOrderField(data.field, data.value);
    handleContactsFormChange();
});

// Финальная отправка заказа
events.on('contacts:submit', () => {
    const orderPayload: IOrder = {
        ...orderModel.getOrderData(),
        items: basketModel.getBasketItems().map(item => item.id),
        total: basketModel.getTotal()
    };
    appApi.createOrder(orderPayload)
        .then(result => {
            basketModel.clearBasket();
            orderModel.clearOrder();
            order.clear();
            contacts.clear();
            modal.render({ content: success.render({ total: result.total }) });
        })
        .catch(err => {
            console.error('Ошибка:', err);
        });
});

// Получаем данные с сервера
appApi.getProductList()
    .then(catalog => {
        productModel.setCatalog(catalog);
    })
    .catch(err => {
        console.error('Ошибка при получении товаров:', err);
    });