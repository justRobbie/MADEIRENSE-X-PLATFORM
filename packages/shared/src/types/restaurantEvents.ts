import type {
    Orders,
    Payments,
    Products,
    Restaurant_Events,
    Restaurants,
    Tickets_Purchased,
    Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type boughtTicketType = (
    Tickets_Purchased &
    Partial<{
        Orders: Orders & { Payments: ReadonlyArray<Partial<Payments>> },
        Users_Tickets_Purchased_validator_idToUsers: Partial<Users> | null,
        Users_Tickets_Purchased_user_idToUsers: Partial<Users>,
    }>
);

export type restaurantEventType = (
    Restaurant_Events &
    {
        Restaurants?: Partial<Restaurants>,
        Products?: ReadonlyArray<Products>,
        _count?: Partial<{
            Orders: number,
            Payments: number,
            Products: number,
            Tickets_Purchased: number
        }>
    }
);

export type restaurantEventPayloadType = {
    restaurant_id: number,
    name: string,
    description: string | null,
    event_date: Date,
    start_time: string,
    end_time: string,
    price: number,
    spots?: number,
    thumbnail_url: string | null,
    video_url: string | null
};