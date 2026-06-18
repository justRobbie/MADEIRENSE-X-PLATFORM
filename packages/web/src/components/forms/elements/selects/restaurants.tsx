import {
    useMemo
} from "react";

import { useApp } from "contexts/App";

import type { ISelectProps } from "./interface";

// ***************************************************************************************************************

function RestaurantsSelect(_props: ISelectProps) {
    const {
        defaultOptionLabel = "Escolha um restaurante",
        disabled = false,
        defaultValue = "",
        defaultOptionValue = "",
        withoutDefaultOption = false,
        hideDefaultOption = false,
        ...props
    } = _props;

    const { get, state } = useApp();

    const restaurants = useMemo(() => (get("Restaurants") ?? []), [get]);

    const assertions = {
        "isLoading": [
            "updating-Restaurants",
            "fetching-Restaurants",
            "loading"
        ].includes(state)
    };

    if (!restaurants || restaurants.length === 0) return null;

    return <select
        disabled={assertions.isLoading || disabled}
        defaultValue={withoutDefaultOption ? restaurants[0].restaurant_id : defaultValue}
        {...props}
    >
        {(assertions.isLoading)
            ? <option value="" disabled>
                A carregar...
            </option>

            : <>
                {!withoutDefaultOption && <option
                    hidden={hideDefaultOption}
                    value={defaultOptionValue}
                >
                    {defaultOptionLabel}
                </option>}

                {restaurants.map(r => <option key={r.restaurant_id} value={r.restaurant_id}>
                    {r.name}
                </option>)}
            </>
        }
    </select>
};

export default RestaurantsSelect;