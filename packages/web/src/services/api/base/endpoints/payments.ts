import BaseAPIAbstractEndpoint from "./abstract";

import type { $Enums } from "@Madeirense/database/browser";

import type { orderPaymentType } from "@Madeirense/shared";

// ***************************************************************************************************************~

class PaymentsEndpoints extends BaseAPIAbstractEndpoint {
    async updateStatus({ payment_id, ...payload }: { payment_id: number, status: $Enums.Payments_status }) {
        const response = await this.client.patch<typeof payload, orderPaymentType>(`/payments/${payment_id}/status`, payload);

        return response.data;
    }
};

export default PaymentsEndpoints;