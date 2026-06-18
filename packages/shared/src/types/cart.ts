import type {
    Cart,
    Coupons,
    Users
} from "@Madeirense/database/browser";

import {
    Carts
} from "../utilities/enumerators.js";

import type { 
    productType
} from "./products.js";


// ***************************************************************************************************************

export type cartedProductType = (
    productType &
    {
        quantity: number
    }
);

export type cartSummaryType = {
    totalItems: number,
    originalPrice: number,
    totalDiscount: number,
    totalPrice: number,
    coupon?: Omit<Coupons, (`${("created" | "updated")}_at`)>
};

export type cartType = (keyof typeof Carts);

export type cartWithProductsType = (
    Omit<Cart, ("product_id")> &
    {
        Products: Omit<cartedProductType, ("quantity")>
    }
);

export type userCartType = (
    cartWithProductsType &
    {
        Users: Partial<Users>
    }
);