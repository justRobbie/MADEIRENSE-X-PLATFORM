import BaseAPIAbstractEndpoint from "./abstract";

import {
    type chatEntryType,
    type Madeirense$Types,
    type orderPayloadType,
    type restaurantOrderType,
} from "@Madeirense/shared";

import type {
    $Enums,
    Order_History,
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

class OrdersEndpoints extends BaseAPIAbstractEndpoint {
    async assignOrderToDriver(order_id: number, payload: { courier_id: number, restaurant_id: number, notes?: string }) {
        const response = await this.client.post<typeof payload, restaurantOrderType>(`/orders/${order_id}/assign`, payload);

        return response.data;
    }

    async reallocateDriver(order_id: number, payload: { courier_id: number, restaurant_id: number, notes: string }) {
        const response = await this.client.post<typeof payload, restaurantOrderType>(`/orders/${order_id}/reallocate`, payload);

        return response.data;
    }

    async cancel(id: number, notes: string) {
        const response = await this.client.patch<{ notes: typeof notes }, restaurantOrderType>(`/orders/${id}/cancel`, { notes });

        return response.data;
    }

    async getMyOrders(query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<restaurantOrderType[]>(`/orders/mine`, query);

        return response;
    }

    async get(id: number) {
        const response = await this.client.get<restaurantOrderType>(`/orders/${id}`);

        return response.data;
    }

    async getAll(query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<restaurantOrderType[]>(`/orders`, query);

        return response;
    }

    async getChatMessages(id: number) {
        const response = await this.client.get<chatEntryType[]>(`/orders/${id}/chat-messages`);

        return response.data;
    }

    async getHistory(id: number) {
        const response = await this.client.get<(Order_History & { Users: Partial<Users> })[]>(`/orders/${id}/history`);

        return response.data;
    }

    async create(payload: orderPayloadType) {
        const response = await this.client.post<typeof payload, restaurantOrderType>(`/orders`, payload);

        return response.data;
    }

    async delete(id: number) {
        const response = await this.client.delete<undefined>(`/orders/${id}`);

        return response;
    }

    async updateStatus({ order_id, ...payload }: { order_id: number, status: $Enums.Orders_status, notes?: string }) {
        const response = await this.client.patch<typeof payload, restaurantOrderType>(`/orders/${order_id}/status`, payload);

        return response.data;
    }

    async postChatMessages(payload: { order_id: number, message_text: string }) {
        const response = await this.client.post<typeof payload, chatEntryType>(`/orders/${payload.order_id}/chat-messages`, payload);

        return response.data;
    }
};

export default OrdersEndpoints;