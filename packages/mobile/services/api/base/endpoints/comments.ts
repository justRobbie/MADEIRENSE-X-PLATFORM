import BaseAPIAbstractEndpoint from "./abstract";

import type {
    Madeirense$Types,
    productCommentType
} from "@Madeirense/shared";

// ***************************************************************************************************************

class CommentsService extends BaseAPIAbstractEndpoint {
    async get(id: number) {
        const response = await this.client.get<productCommentType>(`/comments/${id}`);

        return response.data;
    }

    async getAll(query: Madeirense$Types.searchQueryRecord) {
        const response = await this.client.get<ReadonlyArray<productCommentType>>(`/comments`, query);

        return response;
    }

    async post(payload: { product_id: number, comment: string }) {
        const response = await this.client.post<typeof payload, productCommentType>(`/comments`, payload);

        return response.data;
    }
};

export default CommentsService;