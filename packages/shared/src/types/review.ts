import type { 
    Order_Items, 
    Orders, 
    Prisma, 
    Restaurants, 
    User_Reviews, 
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type reviewType = User_Reviews & {
    Users?: Partial<Users>,
    Orders?: Partial<Orders> & Partial<{
        Restaurants: {
            restaurant_id: Restaurants["restaurant_id"],
            name: Restaurants["name"]
        },
        Order_Items: (Partial<Order_Items> & {
            Products?: {
                product_id: number,
                name: string,
                price: Prisma.Decimal
            }
        })[]
    }>
};