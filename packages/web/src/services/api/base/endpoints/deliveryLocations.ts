import BaseAPIAbstractEndpoint from "./abstract";

import { 
    type Madeirense$Types
} from "@Madeirense/shared";

import type { 
    Delivery_Locations
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

class DeliveryLocationsEndpoints extends BaseAPIAbstractEndpoint {
    async getMyLocations(query: Madeirense$Types.searchQueryRecord = {}) {
        const response = await this.client.get<Delivery_Locations[]>(`/delivery-locations`, query);

        return response.data;
    }

    async get(id: number) {
        const response = await this.client.get<Delivery_Locations>(`/delivery-locations/${id}`);

        return response.data;
    }

    async create(payload: Partial<Omit<Delivery_Locations, "location_id">>) {
        const response = await this.client.post<typeof payload, Delivery_Locations>(`/delivery-locations`, payload);

        return response.data;
    }

    async delete(id: number) {
        const response = await this.client.delete<undefined>(`/delivery-locations/${id}`);

        return response;
    }

    async update(payload: Delivery_Locations) {
        const response = await this.client.put<typeof payload, Delivery_Locations>(`/delivery-locations/${payload.location_id}`, payload);

        return response.data;
    }

    async update_PARTIAL(payload: Partial<Delivery_Locations>) {
        const response = await this.client.patch<typeof payload, Partial<Delivery_Locations>>(`/delivery-locations/${payload.location_id}`, payload);

        return response.data;
    }
};

export default DeliveryLocationsEndpoints;