import type {
    Delivery_Locations,
    Favorites,
    Push_Notification_Subscriptions,
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type authenticatedProfileType = (
    Users &
    Partial<{
        Delivery_Locations: Delivery_Locations[],
        Favorites: Partial<Favorites>[],
        Push_Notification_Subscriptions: (Partial<Push_Notification_Subscriptions>)[]
    }>
);