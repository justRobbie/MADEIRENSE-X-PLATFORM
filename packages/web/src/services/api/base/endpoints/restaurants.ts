import BaseAPIAbstractEndpoint from "./abstract";

import { 
    API$Enumerators,
    type driverType,
    type Madeirense$Types,
    type restaurantType,
    type restaurantPayloadType,
    type restaurantProductType,
} from "@Madeirense/shared";

import type { 
    $Enums,
    Restaurant_Events,
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

class RestaurantsEndpoints extends BaseAPIAbstractEndpoint {
    async batchOperations(
        type: API$Enumerators.BatchActions,
        { 
            body, 
        }: Partial<{ 
            body: Partial<Omit<restaurantPayloadType, "location">>
        }> = {}
    ) {
        switch (type) {
            case API$Enumerators.BatchActions.update:
                return (await this.client.patch<typeof body, ReadonlyArray<restaurantType>>(`/restaurants/batch`, body)).data

            default:
                console.error("Unknown batch operations type: ", type);

                return null;
        };
    }

    async get(id: number) {
        const response = await this.client.get<restaurantType>(`/restaurants/${id}`);

        return response.data;
    }

    async getRestaurantOrderCounterState(id: number) {
        const response = await this.client.get<ReadonlyArray<{ _count: number, status: $Enums.Orders_status }>>(`/restaurants/${id}/statistics/orders`);

        return response.data;
    }

    async getAll(query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<ReadonlyArray<restaurantType>>(`/restaurants`, query);

        return response;
    }

    async getAllAvailableDrivers(query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<ReadonlyArray<driverType>>(`/restaurants/drivers/all`, query);

        return response;
    }

    async getRestaurantAvailableDrivers(id: number, query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<Users[]>(`/restaurants/${id}/drivers`, query);

        return response;
    }

    async getEvents(id: number, query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<Restaurant_Events[]>(`/restaurants/${id}/events`, query);

        return response.data;
    }

    async getProducts(id: number, query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<ReadonlyArray<restaurantProductType>>(`/restaurants/${id}/products`, query);

        return response.data;
    }

    async create(payload: restaurantPayloadType) {
        const response = await this.client.post<typeof payload, restaurantType>(`/restaurants`, payload);

        return response.data;
    }

    async delete(id: number) {
        const response = await this.client.delete<undefined>(`/restaurants/${id}`);

        return response;
    }

    async update(restaurant_id: number, payload: restaurantPayloadType) {
        const response = await this.client.put<typeof payload, restaurantType>(`/restaurants/${restaurant_id}`, payload);

        return response.data;
    }

    async update_PARTIAL(restaurant_id: number, payload: Partial<restaurantPayloadType>) {
        const response = await this.client.patch<typeof payload, Partial<restaurantType>>(`/restaurants/${restaurant_id}`, payload);

        return response.data;
    }
};

export default RestaurantsEndpoints;