import {
    useMemo
} from "react";

import { useApp } from "contexts/App";

import type { ISelectProps } from "./interface";

// ***************************************************************************************************************

function RestaurantEventsSelect(_props: ISelectProps) {
    const {
        defaultOptionLabel = "Escolha evento restaurante",
        defaultOptionValue = "",
        defaultValue = "",
        disabled = false,
        hideDefaultOption = false,
        withoutDefaultOption = false,
        ...props
    } = _props;

    const { get, state } = useApp();

    const events = useMemo(() => (get("Restaurant_Events") ?? []), [get]);

    const assertions = {
        "isLoading": [
            "updating-Restaurant_Events",
            "fetching-Restaurant_Events",
            "loading"
        ].includes(state)
    };

    if (!events || events.length === 0) return null;

    return <select
        disabled={assertions.isLoading || disabled}
        defaultValue={withoutDefaultOption ? events[0].event_id : defaultValue}
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

                {events.map(r => <option key={r.event_id} value={r.event_id}>
                    {r.name}
                </option>)}
            </>
        }
    </select>
};

export default RestaurantEventsSelect;