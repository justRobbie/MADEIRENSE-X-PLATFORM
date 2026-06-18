import {
    useMemo,
    type ComponentProps
} from "react";

import {
    resolveClassNames,
    type restaurantOrderType
} from '@Madeirense/shared';

import LeafletMap from 'components/leaflet/map';
import LeafletMadeirenseRestaurantPopup from 'components/popups/leaflet/madeirenseRestaurant';

import { useApp } from 'contexts/App';

import styles from "./deliveryTracker.module.css";

import type { markerType } from "components/leaflet/types";

import "leaflet/dist/leaflet.css";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"div"> {
    disabled?: boolean;
    markers?: markerType[];
    onMapReady?: () => void;
    order: restaurantOrderType;
};

const LeafletDeliveryTracker = (_props: IPropTypes) => {
    const {
        className,
        disabled = false,
        markers = [],
        onMapReady,
        order,
        ...props
    } = _props;

    const { get } = useApp();

    const restaurants = useMemo(() => get("Restaurants") || [], [get]);

    const restaurantMarkers: markerType[] = useMemo(
        () => restaurants.map(({ Delivery_Locations, ...r }) => ({
            id: r.restaurant_id,
            latitude: parseFloat(`${Delivery_Locations?.latitude ?? 0}`),
            longitude: parseFloat(`${Delivery_Locations?.longitude ?? 0}`),
            popup: <LeafletMadeirenseRestaurantPopup restaurant={r} />
        })) as markerType[],
        [restaurants]
    );

    return <LeafletMap
        className={resolveClassNames(styles.tracker, className)}
        markers={[...restaurantMarkers, ...markers]}
        {...props}
    />
};

export default LeafletDeliveryTracker;