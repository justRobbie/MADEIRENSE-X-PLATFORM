import {
    useMemo,
    type ComponentProps
} from "react";

import {
    formatNumber,
    resolveClassNames
} from "@Madeirense/shared";

import styles from "./items.module.css";

import type {
    Order_Items,
    Products
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"ul"> {
    items: (Order_Items & { Products: Partial<Products> })[];
};

function OrderItemsList(_props: IPropTypes) {
    const {
        className,
        items,
        ...props
    } = _props;

    const total_amount = useMemo(() => {
        return items.reduce((prev, item) => {
            const price = (parseFloat((item.Products?.price ?? "0").toString()));
            const percentage = (price * (parseFloat((item.Products?.discount ?? "0").toString()) / 100));
            const total = price - percentage;

            return (prev + (item.quantity * total))
        }, 0)
    }, [items]);

    return <ul
        className={resolveClassNames(
            styles.list,
            className
        )}
        {...props}
    >
        {items.map(({ item_id, quantity, Products }) => <li key={item_id} className="w-full">
            <div data-type="thumbnail" style={{ backgroundImage: `url(${Products.thumbnail ?? "#"})` }}></div>

            <span className="font-bold italic">{Products.name}</span>

            <span>({`x${quantity}`})</span>

            <div className="ml-auto flex flex-col justify-end items-center gap-1">
                {(parseInt((Products.price ?? "0").toString()) === 0) ? "Grátis" : <>
                    <span className="font-semibold">{formatNumber(parseFloat(`${Products.price}`) * quantity)}</span>

                    {quantity > 1 && <span className="italic opacity-50 text-sm">({formatNumber(parseFloat(`${Products.price}`))})</span>}
                </>}
            </div>
        </li>)}

        <li className="w-full">
            {!total_amount ? "Grátis" : <>
                <span className="uppercase">Total</span>
                <span className="italic">{formatNumber(total_amount)}</span>
            </>}
        </li>
    </ul>
};

export default OrderItemsList;