import {
    DB$Enumerators,
    type Coupons
} from "@Madeirense/database/browser";

import { API$Enumerators } from "../services/enumerators.js";
import { Madeirense$Enumerators } from "./utilities/enumerators.js";

import type { API$Types } from "../services/types.js";
import type { applicationSettingsType } from "../types/globalSettings.js";
import type { productType } from "../types/products.js";
import type { restaurantEventType } from "../types/restaurantEvents.js";
import type { restaurantType } from "../types/restaurants.js";
import type { driverType } from "../types/users.js";

// ***************************************************************************************************************

export namespace Madeirense$Types {
    type actionType = keyof typeof API$Enumerators.Actions;

    export type appProperties = {
        Global_Settings: applicationSettingsType,
        Coupons: ReadonlyArray<Coupons>,
        Products: ReadonlyArray<productType>,
        Drivers: ReadonlyArray<driverType>,
        Restaurants: ReadonlyArray<restaurantType>,
        Restaurant_Events: ReadonlyArray<restaurantEventType>,
    }

    type idType<ExtendedTypes = "HELLO_WORLD"> = (
        | `APP_PROPERTY$${(keyof appProperties | "Global_Settings_Eligible_Payment_Types")}$${actionType}`
        | `BACK_OFFICE$${(keyof typeof Madeirense$Enumerators.Pages.BackOffice)}$${actionType}`
        | "CHAT_REPLY"
        | `COURIER_POSITION$${"PING"}`
        | `ORDER_${("COUPON_USE" | `DRIVER_${("" | "RE")}ASSIGNATION` | "STATUS_UPDATE" | actionType)}`
        | `PRODUCT_${("COMMENT" | actionType)}`
        | ExtendedTypes
    )

    export type pushNotification<D, T extends (string) = "HELLO_WORLD"> = {
        notificationId: `MXP$${idType<T>}`,
        data: D & Partial<{ user_id: number, property_id: number }>
    }

    export type searchQueryRecord = (
        Partial<Record<(keyof typeof Madeirense$Enumerators.SearchQueries), (string | string[])>> &
        API$Types.searchQueryRecord
    )

    export type statisticsParameter<Property extends string> = `${Property}/per/${(keyof typeof DB$Enumerators.Tables)}`;
};