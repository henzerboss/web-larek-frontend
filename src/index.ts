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
import { TOrderForm, IProductItem } from './types';

// Брокер событий
const events = new EventEmitter();

// Базовый класс API
const api = new Api(API_URL);
// API нашего приложения
const appApi = new AppApi(api);

// Модели данных
const productModel = new ProductModel(events);
const basketModel = new BasketModel(events);

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

// блок и разблок страницы при открытии модалки
events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});

// Обновление товаров на главной
events.on('items:changed', () => {
    page.catalog = productModel.getCatalog().map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render(item);
    });
});

// Открытие превью товара по клику на карточку
events.on('card:select', (item: IProductItem) => {
    productModel.setPreview(item);
});

// Открытие модального окна с деталями товара
events.on('preview:changed', (item: IProductItem) => {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (basketModel.isItemInBasket(item.id)) {
                basketModel.removeFromBasket(item.id);
            } else {
                basketModel.addToBasket(item);
            }
        }
    });
    // Обновляем состояние кнопки в зависимости от того, в корзине ли товар
    card.inBasket = basketModel.isItemInBasket(item.id);
    modal.render({ content: card.render(item) });
    modal.open();
});

// Обновление счетчика корзины и состояния кнопок в превью
events.on('basket:changed', () => {
    page.counter = basketModel.getBasketItems().length;
    // Обновляем открытую карточку, если она есть
    const previewId = productModel.getPreviewId();
    const previewItem = previewId ? productModel.findItem(previewId) : null;
    if (modal.container.contains(document.querySelector('.card_full')) && previewItem) {
        events.emit('preview:changed', previewItem);
    }
    // Обновляем саму корзину, если она открыта
    if (modal.container.contains(document.querySelector('.basket'))) {
        events.emit('basket:open');
    }
});


// Открытие корзины
events.on('basket:open', () => {
    const basketItems = basketModel.getBasketItems().map((item, index) => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => basketModel.removeFromBasket(item.id)
        });
        card.index = index + 1; // Устанавливаем индекс через сеттер
        return card.render(item);
    });
    basket.items = basketItems;
    basket.total = basketModel.getTotal();
    modal.render({ content: basket.render() });
    modal.open();
});

// Оформление заказа (Адрес и оплата)
events.on('order:open', () => {
    modal.render({
        content: order.render({
            address: basketModel.getOrder().address,
            valid: !basketModel.validateOrder(),
            errors: basketModel.validateOrder() || ''
        })
    });
    order.selectPayment(basketModel.getOrder().payment);
});

// Обработчики ошибок в формах
function handleOrderFormChange() {
    const error = basketModel.validateOrder();
    order.valid = !error;
    order.errors = error || '';
}

function handleContactsFormChange() {
    const error = basketModel.validateContacts();
    contacts.valid = !error;
    contacts.errors = error || '';
}

events.on('order:input', (data: { field: keyof TOrderForm, value: string }) => {
    basketModel.setOrderField(data.field, data.value);
    handleOrderFormChange();
});

events.on('payment:change', (data: { method: string }) => {
    basketModel.setOrderField('payment', data.method);
    handleOrderFormChange();
});

// Переход ко второй форме (контакты)
events.on('order:submit', () => {
    // Проверяем валидность первой формы перед переходом
    const error = basketModel.validateOrder();
    if (error) {
        order.errors = error;
    } else {
        // Если ошибок нет, очищаем поле ошибок и рендерим следующую форму
        order.errors = '';
        const currentOrderData = basketModel.getOrder();
        
        modal.render({
            content: contacts.render({
                phone: currentOrderData.phone,
                email: currentOrderData.email,
                // Проверяем валидность второй формы, чтобы кнопка "Оплатить" была в правильном состоянии, если пользователь уже вводил данные
                valid: !basketModel.validateContacts(),
                errors: basketModel.validateContacts() || ''
            })
        });
    }
});

// Обработка ввода во второй форме (контакты)
events.on('contacts:input', (data: { field: keyof TOrderForm, value: string }) => {
    basketModel.setOrderField(data.field, data.value);
    handleContactsFormChange();
});

// Отправка формы контактов и создание заказа
events.on('contacts:submit', () => {
    const error = basketModel.validateContacts();
    if (error) {
        contacts.errors = error;
    } else {
        const orderPayload = basketModel.createOrderPayload();
        appApi.createOrder(orderPayload)
            .then(result => {
                basketModel.clearBasket();
                order.clear();
                contacts.clear();
                modal.render({ content: success.render({ total: result.total }) });
            })
            .catch(err => {
                console.error('Ошибка при создании заказа:', err);
            });
    }
});

// Получаем данные с сервера
appApi.getProductList()
    .then(catalog => {
        productModel.setCatalog(catalog);
    })
    .catch(err => {
        console.error('Ошибка при получении товаров:', err);
    });