import BaseAPIAbstractEndpoint from "./abstract";

import type { User_Reviews } from "@Madeirense/database/browser";

// ***************************************************************************************************************

class ReviewsEndpoints extends BaseAPIAbstractEndpoint {
    async post(payload: { order_id: number, rating: number, comment: string }) {
        const response = await this.client.post<typeof payload, User_Reviews>(`/reviews`, payload);

        return response.data;
    }
};

export default ReviewsEndpoints;