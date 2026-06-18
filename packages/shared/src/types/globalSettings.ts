import type { 
    Global_Settings, 
    Global_Settings_Eligible_Payment_Types
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type applicationSettingsType = (
    Global_Settings &
    {
        Global_Settings_Eligible_Payment_Types: ReadonlyArray<Omit<Global_Settings_Eligible_Payment_Types, "setting_id">>
    }
);