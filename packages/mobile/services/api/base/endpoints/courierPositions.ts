import BaseAPIAbstractEndpoint from "./abstract";

import type { Courier_Positions } from "@Madeirense/database/browser";

// ***************************************************************************************************************

class CourierPositionsEndpoints extends BaseAPIAbstractEndpoint {
    async getMyCurrentPosition() {
        const response = await this.client.get<Courier_Positions>(`/courier-positions/me`);

        return response.data;
    }

    async getOrderCourierPosition(id: number) {
        const response = await this.client.get<Courier_Positions>(`/courier-positions/order/${id}`);

        return response.data;
    }

    async ping(id: number, payload: Partial<Omit<Courier_Positions, "position_id">>) {
        const response = await this.client.patch<typeof payload, Partial<Courier_Positions>>(`/courier-positions/ping/${id}`, payload);

        return response.data;
    }
};

export default CourierPositionsEndpoints;