import type { 
    Orders,
    Payments,
    Restaurants,
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type orderPaymentType = (
    Payments &
    {
        Users?: {
            user_id: Users["user_id"],
            name: Users["name"],
            email: Users["email"]
        },
        Orders: {
            order_id: Orders["order_id"],
            total_amount: Orders["total_amount"],
            status: Orders["status"],
            Restaurants?: {
                name: Restaurants["name"]
            }
        }
    }
);