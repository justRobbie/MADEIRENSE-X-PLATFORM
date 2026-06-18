import type {
    $Enums,
    DB$Types,
    Delivery_Locations,
    Products,
    Restaurant_Events,
    Restaurant_Hours,
    Restaurants,
    Users,
    Workstations
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type restaurantType = (
    Restaurants &
    {
        Products?: ReadonlyArray<Partial<Products>>,
        Restaurant_Hours?: ReadonlyArray<Partial<Restaurant_Hours>>,
        Delivery_Locations: {
            location_id: Delivery_Locations["location_id"],
            address: Delivery_Locations["address"],
            latitude: Delivery_Locations["latitude"],
            longitude: Delivery_Locations["longitude"],
        } | null,
        Restaurant_Events?: ReadonlyArray<Restaurant_Events>,
        WorkStations?: ReadonlyArray<Workstations & { Users: Users }>
        _count?: DB$Types.tableCountRecord
    }
);

export type restaurantPayloadType = {
    name: string,
    location: Omit<Delivery_Locations, (
        | "location_id"
        | "created_at"
        | "updated_at"
        | "user_id"
        | "special_instructions"
    )>,
    thumbnail_url: string | null,
    schedule: ReadonlyArray<scheduleType>,
    ttd: number,
    ttp: number
};

export type restaurantProductType = (
    Products &
    {
        _count: DB$Types.tableCountRecord
    }
);

export type scheduleType = {
    day_of_week: $Enums.Restaurant_Hours_day_of_week,
    closing_time: `${number}:${number}`,
    opening_time: `${number}:${number}`,
    is_closed: boolean
};