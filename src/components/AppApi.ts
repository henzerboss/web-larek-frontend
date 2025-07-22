import { Api, ApiListResponse } from "./base/api";
import { IApi, IProductItem, IOrder, IOrderResult } from "../types";


export class AppApi implements IApi {
    private api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    getProductItem(id: string): Promise<IProductItem> {
        return this.api.get(`/product/${id}`).then(
            (item: IProductItem) => item
        );
    }

    getProductList(): Promise<IProductItem[]> {
        return this.api.get('/product').then(
            (data: ApiListResponse<IProductItem>) => data.items
        );
    }

    createOrder(order: IOrder): Promise<IOrderResult> {
        return this.api.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }
}