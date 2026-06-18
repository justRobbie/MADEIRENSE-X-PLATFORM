import { 
    useEffect, 
    useState
} from "react";

import { useSearchParams } from "react-router-dom";

import { 
    findNearestRestaurantWithLocation,
    type restaurantType, 
} from "@Madeirense/shared";

import { useApp } from "contexts/App";

import Icon from "components/icon";
import MenuProductsGrid from "components/grids/products/menu";

import type { 
    $Enums
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

function HomePage() {
    const { 
        get,
        state,
    } = useApp();

    const [searchParams] = useSearchParams();
    
    const defaultProduct_type = (searchParams.get("product_type") as $Enums.Products_product_type | "all");

    const [closest_restaurant, setClosestRestaurant] = useState<restaurantType | null>(null);
    
    useEffect(() => {
        if ([
            state !== "idle",
            closest_restaurant !== null
        ].includes(true)) return;

        findNearestRestaurantWithLocation((get("Restaurants") ?? [])).then(setClosestRestaurant);
    }, [get, state, closest_restaurant]);

    return <>
        <div data-element="pattern" data-position="left"></div>

        <main className="relative">
            <span data-text="tag" className="mx-auto w-fit mb-7">
                {!closest_restaurant ? <Icon name="Loading" className="animate-spin" /> : <>
                    <Icon name="Restaurant" />

                    {closest_restaurant.name}
                </>}
            </span>

            <MenuProductsGrid
                group="menu"
                defaultRestaurant={closest_restaurant?.restaurant_id}
                productType={defaultProduct_type === "all" ? undefined : defaultProduct_type}
                className="w-full"
                trackAppUpdates
            />
        </main>

        <div data-element="pattern" data-position="right"></div>
    </>
};

export default HomePage;