import {
    type ComponentProps
} from "react";

import type {
    Delivery_Locations
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"select"> {
    defaultLocationId?: number;
    defaultOptionLabel?: string;
    locations: Delivery_Locations[];
};

function DeliveryLocationsSelect(_props: IPropTypes) {
    const { 
        defaultLocationId, 
        defaultOptionLabel = "Escolha uma localização de entrega",
        locations, 
        ...props
    } = _props;

    return <select
        defaultValue={defaultLocationId?.toString() || ""}
        className="w-full p-2 border rounded"
        {...props}
    >
        <option value="" hidden>
            {defaultOptionLabel}
        </option>

        {locations.map(location => <option key={location.location_id} value={location.location_id}>
            {`${location.name} - ${location.address}`}
        </option>)}
    </select>
};

export default DeliveryLocationsSelect;