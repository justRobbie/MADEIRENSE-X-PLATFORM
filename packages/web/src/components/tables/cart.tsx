import {
    useMemo,
    useState,
    type ComponentProps,
    type SubmitEvent,
    type MouseEvent,
} from "react";

import { Link } from "react-router-dom";

import {
    formatMinutes,
    formatNumber,
    resolveClassNames,
    type cartType
} from "@Madeirense/shared";

import { useCart } from "contexts/Cart";

import Button from "components/buttons";
import Icon from "components/icon";

import styles from "./cart.module.css";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"table"> {
    hideInstructions?: boolean;
    hideTTP?: boolean;
    mode?: "cart" | "order";
    type: cartType;
}

type queueEntry = {
    product_id: number,
    type: "adding" | "removing",
};

function Cart({
    hideInstructions = false,
    hideTTP = false,
    mode = "cart",
    type,
    ..._props
}: IPropTypes) {
    const {
        state,
        cart: _c,
        add,
        applyCoupon,
        clear,
        remove
    } = useCart();

    const {
        deliveryCart,
        deliverySummary,
        eventCart,
        eventSummary
    } = _c;

    const assertions = {
        "isDelivery": (type === "delivery"),
        "isUpdatingSummary": [
            "updating-deliverySummary",
            "updating-eventSummary",
        ].includes(state)
    };

    const cart = assertions.isDelivery ? deliveryCart : eventCart;
    const summary = assertions.isDelivery ? deliverySummary : eventSummary;

    const preparationETA = useMemo(() => Math.max(...cart.map(p => p.prep_time_minutes)), [cart]);

    const [error, setError] = useState<Error | null>(null);
    const [queue, setQueue] = useState<queueEntry[]>([]);
    const [show, toggle] = useState<boolean>(false);

    function addItem() {
        return async (e: MouseEvent) => {
            const product_id = parseInt((e.target as HTMLButtonElement).value);

            setQueue(q => [...q, { product_id, type: "adding" }]);
            setError(null);

            await add(product_id);

            setQueue(q => q.filter(q => q.product_id !== product_id));
        }
    };

    async function applyCouponCode(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const elements = form.elements;

        setError(null);

        try {
            await applyCoupon((elements.namedItem("coupon_code") as HTMLInputElement).value, type);
        } catch (e) {
            setError(new Error((e as Error).message));
        }
    };

    function handleEmptyingCart({ target }: MouseEvent<HTMLButtonElement>) {
        clear((target as HTMLButtonElement).value as cartType);
    }

    function removeItem() {
        return async (e: MouseEvent) => {
            const product_id = parseInt((e.target as HTMLButtonElement).value);

            setQueue(q => [...q, { product_id, type: "removing" }]);
            setError(null);

            await remove(product_id);

            setQueue(q => q.filter(q => q.product_id !== product_id));
        }
    };

    const {
        className,
        ...props
    } = _props;

    const $tableProps = {
        "className": resolveClassNames(styles[mode], className),
        ...props
    };

    const TABLE_ERROR_ROW = !error ? null : <tr data-type="error">
        <td colSpan={4}>
            <div>
                <Icon name="ExclamationCircle" />

                <span>{error.message}</span>

                <Icon name="Close" className="ml-auto cursor-pointer" onClick={() => setError(null)} />
            </div>
        </td>
    </tr>;

    const TABLE_ETA_ROW = (preparationETA === 0) ? null : <tr data-section="eta">
        <td colSpan={4}>
            <div className="flex flex-row items-center justify-start gap-2 w-full">
                <Icon name="Time" />

                <span className="mr-auto">Tempo estimado de preparo</span>

                <span className="font-semibold text-2xl ml-auto">
                    {formatMinutes(preparationETA)}
                </span>
            </div>
        </td>
    </tr>;

    const TABLE_SUMMARY_FOOTER = !Boolean(cart.length) ? null : <tr data-section="summary">
        <td colSpan={4}>
            <div className="w-full flex flex-col items-start justify-start">
                {(summary.coupon || Boolean(summary.totalDiscount)) && <div data-row="original" className="mb-2 opacity-40">
                    <span className="font-black text-2xl">Preço</span>

                    <span className="font-black text-2xl">{formatNumber(summary.originalPrice)}</span>
                </div>}

                {summary.coupon && <div data-row="coupon">
                    <span className="font-bold text-lg">Cupom de desconto</span>

                    <span className="underline font-bold text-lg">{`${summary.coupon.code} (${summary.coupon.discount}%)`}</span>
                </div>}

                {Boolean(summary.totalDiscount) && <div data-row="discount">
                    <span className="font-bold text-lg">Total de desconto</span>

                    <div className="flex flex-row justify-start items-center gap-1" data-state={assertions.isUpdatingSummary ? "disabled" : "idle"}>
                        {assertions.isUpdatingSummary && <Icon name="Loading" className="animate-spin" />}

                        <span className="font-bold text-lg">
                            -{formatNumber(summary.totalDiscount)}
                        </span>
                    </div>
                </div>}

                <div data-row="total">
                    <span className="font-black text-2xl">Total</span>

                    <div className="flex flex-row justify-start items-center gap-1" data-state={assertions.isUpdatingSummary ? "disabled" : "idle"}>
                        {assertions.isUpdatingSummary && <Icon name="Loading" className="animate-spin" />}

                        {(summary.totalItems > 0) && <span className="font-black text-2xl">
                            {!summary.totalPrice ? "Grátis" : formatNumber(summary.totalPrice)}
                        </span>}
                    </div>
                </div>
            </div>
        </td>
    </tr>;

    switch (mode) {
        case "cart": {
            return <table
                data-state={state}
                onClick={() => toggle(true)}
                onMouseLeave={() => toggle(false)}
                {...{
                    ...(Boolean(cart.length) ? { ["data-visible"]: "" } : {}),
                    ...(show ? { ["data-expanded"]: "" } : {})
                }}
                {...$tableProps}
            >
                <tfoot>
                    {TABLE_SUMMARY_FOOTER}

                    <tr>
                        <td colSpan={4}>
                            <div className="w-full flex flex-row items-center justify-end gap-2">
                                <Button value={type} onClick={handleEmptyingCart} variant="secondary">
                                    {["discarding"].includes(state)
                                        ? <Icon name="Loading" className="animate-spin" />
                                        : <Icon name="Trash" />
                                    }

                                    Descartar
                                </Button>

                                <Link className="Button" data-variant="primary" to={`/checkout/products`}>
                                    Ir para checkout
                                </Link>
                            </div>
                        </td>
                    </tr>
                </tfoot>

                <tbody>
                    <tr>
                        <td colSpan={4}>
                            <div className="flex flex-row items-center justify-start gap-2 w-full">
                                <Icon name="ShoppingCart" />

                                <span className="mr-auto">Carrinho</span>

                                {/* <Button variant="secondary">
                        <Icon name="ChevronLeft" className={show ? "rotate-90" : "-rotate-90"} onClick={() => toggle(t => !t)} />
                        </Button> */}

                                <span className={`font-black text-2xl ml-auto${!show ? " opacity-100" : " opacity-0"}`}>
                                    {summary.totalPrice === 0 ? "Grátis" : formatNumber(summary.totalPrice)}
                                </span>
                            </div>
                        </td>
                    </tr>

                    {TABLE_ERROR_ROW}

                    {cart.map((product) => {
                        const { product_id, name, discount: _d, price: _p, thumbnail, quantity } = product;

                        const discount = parseFloat(_d.toString());
                        const price = parseFloat(_p.toString());
                        const whileQuantityIncreases = queue.some(q => q.product_id === product_id && q.type === "adding");
                        const whileQuantityDecreases = queue.some(q => q.product_id === product_id && q.type === "removing");
                        const isInQueue = whileQuantityIncreases || whileQuantityDecreases;

                        return <tr key={product_id} data-hasdiscount={discount > 0}>
                            <td>
                                <div data-type="thumbnail" style={{ backgroundImage: `url(${thumbnail})` }}></div>
                            </td>

                            <td>
                                <span data-text="name" className="font-bold italic">{name}</span>
                            </td>

                            <td>
                                <div className="w-full flex flex-row items-center justify-end gap-3">
                                    <Button value={product_id} onClick={removeItem()} data-shape="round" variant="secondary" disabled={isInQueue}>
                                        {whileQuantityDecreases ? <Icon name="Loading" className="animate-spin" /> : <Icon name="Minus" />}
                                    </Button>

                                    <span className="w-[50px] text-center">{quantity}</span>

                                    <Button value={product_id} onClick={addItem()} data-shape="round" disabled={isInQueue}>
                                        {whileQuantityIncreases ? <Icon name="Loading" className="animate-spin" /> : <Icon name="Plus" />}
                                    </Button>
                                </div>
                            </td>

                            <td data-cell="price" className="text-right">
                                {(discount > 0) && <span data-text="discount">{discount}</span>}

                                <span data-text="price">{price === 0 ? "Grátis" : formatNumber(price)}</span>
                            </td>
                        </tr>
                    })}

                    {!hideTTP && TABLE_ETA_ROW}
                </tbody>
            </table>
        }

        case "order": {
            return <table {...$tableProps}>
                <tfoot>
                    {TABLE_SUMMARY_FOOTER}
                </tfoot>

                <tbody>
                    <tr>
                        <td colSpan={4}>
                            <div className="flex flex-row items-center justify-start gap-2 w-full">
                                <Icon name="Order" />

                                <span className="mr-auto">O seu pedido</span>

                                {(summary.totalPrice > 0) && <form onSubmit={applyCouponCode} className="min-w-[300px]" data-state={!cart.length ? "disabled" : "idle"}>
                                    <div className="ml-auto flex flex-row items-center justify-start flex-nowrap w-full">
                                        <input type="text" name="coupon_code" placeholder="Aplicar cupom de desconto" className="w-full font-semibold" required />

                                        <Button type="submit" disabled={["applying-coupon"].includes(state)}>
                                            {state === "applying-coupon" ? <Icon name="Loading" className="animate-spin" /> : "Aplicar"}

                                            <Icon name="Coupon" />
                                        </Button>
                                    </div>
                                </form>}
                            </div>
                        </td>
                    </tr>

                    {TABLE_ERROR_ROW}

                    {!cart.length && <tr>
                        <td colSpan={4} className="text-center">
                            <span className="italic opacity-40">Sem itens no carrinho</span>
                        </td>
                    </tr>}

                    {cart.map(({ product_id, name, discount: _d, price: _p, thumbnail, quantity }) => {
                        const discount = parseFloat(_d.toString());
                        const price = parseFloat(_p.toString());

                        return <tr key={product_id} data-hasdiscount={discount > 0}>
                            <td>
                                <div data-type="thumbnail" style={{ backgroundImage: `url(${thumbnail})` }}></div>
                            </td>

                            <td>
                                <span data-text="name" className="font-bold italic">{name}</span>
                            </td>

                            <td>
                                <span data-text="quantity" className="font-bold italic">{`x${quantity}`}</span>
                            </td>

                            <td data-cell="price" className="text-right">
                                {(discount > 0) && <span data-text="discount">{discount}</span>}

                                <span data-text="price">{!price ? "Grátis" : formatNumber(price)}</span>
                            </td>
                        </tr>
                    })}

                    {!hideTTP && TABLE_ETA_ROW}

                    {!hideInstructions && <tr>
                        <td colSpan={4}>
                            <fieldset className="w-full flex flex-col justify-start items-start gap-2 my-4">
                                <legend className="flex flex-row justify-start items-center gap-2">
                                    <Icon name="Notes" />

                                    Instruções (Opcional)
                                </legend>

                                <textarea placeholder="Tem alergias? Quer substituir ingredientes?" title="Instruções de preparo" name="special_instructions" className="w-full" rows={3}></textarea>
                            </fieldset>
                        </td>
                    </tr>}
                </tbody>
            </table>
        }

        default: return null;
    }

};

export default Cart;