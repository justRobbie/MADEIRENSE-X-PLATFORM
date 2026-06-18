import BaseAPIAbstractEndpoint from "./abstract";

import { 
    API$Enumerators,
    Madeirense$Enumerators,
    type couponPayloadType,
    type unionBetween
} from "@Madeirense/shared";

import type { 
    Coupons, 
    DB$Types
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

class CouponsEndpoints extends BaseAPIAbstractEndpoint {
    async batchOperations(
        type: API$Enumerators.BatchActions,
        { 
            body
        }: Partial<{ 
            body: { coupon_ids: number[], expires_at?: string }
        }> = {}
    ) {
        switch (type) {
            case API$Enumerators.BatchActions.expire:
                return (await this.client.patch<typeof body, Partial<DB$Types.tableCountRecord>>(`/coupons/batch/expire`, body)).data;

            case API$Enumerators.BatchActions.renew:
                return (await this.client.patch<typeof body, Partial<DB$Types.tableCountRecord>>(`/coupons/batch/renew`, body)).data

            default:
                console.error("Unknown batch operation type: ", type);

                return null;
        };
    }

    async get(id: number) {
        const response = await this.client.get<Coupons>(`/coupons/${id}`);

        return response.data;
    }

    async getAll(query: Partial<Record<(keyof typeof Madeirense$Enumerators.SearchQueries), (string | string[])>> = {}) {
        const response = await this.client.get<Coupons[]>(`/coupons`, query);

        return response;
    }

    async create(payload: couponPayloadType) {
        const response = await this.client.post<typeof payload, Coupons>(`/coupons`, payload);

        return response.data;
    }

    async delete(id: number) {
        const response = await this.client.delete<undefined>(`/coupons/${id}`);

        return response;
    }

    async update(payload: Coupons) {
        const response = await this.client.put<typeof payload, Coupons>(`/coupons/${payload.coupon_id}`, payload);

        return response.data;
    }

    async update_PARTIAL(payload: unionBetween<Partial<Coupons>, { coupon_id: number }>) {
        const response = await this.client.patch<typeof payload, Partial<Coupons>>(`/coupons/${payload.coupon_id}`, payload);

        return response.data;
    }

    async validate(code: string) {
        const response = await this.client.post<{ code: typeof code }, Coupons>(`/coupons/validate`, { code });

        return response.data;
    }
};

export default CouponsEndpoints;