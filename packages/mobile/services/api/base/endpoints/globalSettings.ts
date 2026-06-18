import BaseAPIAbstractEndpoint from "./abstract";

import type {
    $Enums,
    Global_Settings,
} from "@Madeirense/database/browser";

import type {
    applicationSettingsType
} from "@Madeirense/shared";

// ***************************************************************************************************************

class GlobalSettingsEndpoints extends BaseAPIAbstractEndpoint {
    async get() {
        const response = await this.client.get<applicationSettingsType>(`/global-settings`);

        return response.data;
    }

    async getEligiblePayments() {
        const response = await this.client.get<$Enums.Global_Settings_Eligible_Payment_Types_payment_method[]>(`/global-settings/eligible-payments`);

        return response.data;
    }

    async updateEligiblePayments({ setting_id, payments }: { setting_id: number, payments: $Enums.Global_Settings_Eligible_Payment_Types_payment_method[] }) {
        const response = await this.client.post<{ payments: typeof payments }, applicationSettingsType>(`/global-settings/${setting_id}/eligible-payments`, { payments });

        return response.data;
    }

    async update_PARTIAL({ setting_id, ...payload }: Partial<Omit<Global_Settings, "setting_id">> & { setting_id: number }) {
        const response = await this.client.patch<typeof payload, applicationSettingsType>(`/global-settings/${setting_id}`, payload);

        return response.data;
    }
};

export default GlobalSettingsEndpoints;