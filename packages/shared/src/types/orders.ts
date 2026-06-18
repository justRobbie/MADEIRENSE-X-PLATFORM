import type {
    $Enums,
    Chat_Messages,
    Courier_Positions,
    Delivery_Locations,
    Order_History,
    Order_Items,
    Orders,
    Payments,
    Products,
    Restaurants,
    Users
} from "@Madeirense/database/browser";

import {
    RestaurantRevenue
} from "../utilities/enumerators.js";

import type { cartType } from "./cart.js";

// ***************************************************************************************************************

export type chatEntryType = (
    Chat_Messages &
    {
        Orders?: Partial<Orders>,
        Users: Partial<Users>
    }
);

export type revenueType = keyof typeof RestaurantRevenue;

export type restaurantRevenueType = {
    orders: number,
    total: number,
    factual: number
};

export type restaurantOrderType = (
    Orders & {
        Users_Orders_user_idToUsers?: {
            user_id: Users["user_id"],
            name: Users["name"],
            email: Users["email"],
            phone: Users["phone"]
        },
        Users_Orders_courier_idToUsers: (
            Users &
            {
                Courier_Positions: Partial<Courier_Positions>[] | null
            }
        ) | null,
        Payments: ReadonlyArray<Partial<Payments>>,
        Delivery_Locations: Partial<Delivery_Locations> | null,
        Restaurants: (
            Partial<Restaurants> &
            {
                Delivery_Locations: Partial<Delivery_Locations> | null
            }
        ),
        Order_Items: ReadonlyArray<(
            Order_Items &
            { Products: Partial<Products> }
        )>
    }
);

export type restaurantOrderHistoryType = Order_History & {
    Users: Partial<Users>
};

export type orderPayloadType = {
    cartType: cartType,
    restaurant_id: number,
    delivery_address: number,
    contact_phone: string,
    payment_method: $Enums.Payments_payment_method,
    special_instructions?: string,
    coupon_id?: number,
    event_id?: number,
};

export type orderRevenueType = (
    restaurantRevenueType &
    Partial<{
        day: number,
        month: number,
        year: number
    }>
);

export type dailyRevenueType = ({ day: number }) & restaurantRevenueType;
export type monthlyRevenueType = ({ month: number }) & restaurantRevenueType;
export type yearlyRevenueType = ({ year: number }) & restaurantRevenueType;

export type orderType = (
    | "delivery"
    | "ticket"
);