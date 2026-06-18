import type {
    Products,
    Users,
    User_Comments
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type productCommentType = (
    User_Comments &
    {
        Users?: Partial<Users>,
        Products?: (
            Partial<Products> &
            {
                Restaurants: ({
                    restaurant_id: number,
                    name: string
                } | null)
            }
        )
    }
);