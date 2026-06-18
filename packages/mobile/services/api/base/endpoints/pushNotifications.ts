import BaseAPIAbstractEndpoint from "./abstract";

import type { Push_Notification_Subscriptions } from "@Madeirense/database/browser";

// ***************************************************************************************************************

class PushNotificationsEndpoints extends BaseAPIAbstractEndpoint {
    async subscribe(payload: PushSubscriptionJSON) {
        const response = await this.client.post<typeof payload, Push_Notification_Subscriptions>(`/push-notifications/subscribe`, payload);

        return response.data;
    }

    async unsubscribe(id: number) {
        const response = await this.client.delete<{ unsubscribeFromBrowser: boolean }>(`/push-notifications/unsubscribe/${id}`);

        return response.data;
    }

    async unsubscribeAll(id: number) {
        const response = await this.client.delete<undefined>(`/push-notifications/unsubscribe-all/${id}`);

        return response.data;
    }
};

export default PushNotificationsEndpoints;