import {
    useState,
    type ComponentProps,
    type MouseEvent,
} from "react";

import {
    type restaurantType
} from "@Madeirense/shared";

import { useApp } from "contexts/App";
import { useModal } from "contexts/Modal";

import Button from "components/buttons";
import Icon from "components/icon";

import RestaurantCard from "components/cards/restaurant";
import RestaurantForm from "components/forms/add/restaurant";

import RestaurantEventList from "components/lists/restaurantEvents";
import AddRestaurantEventForm from "components/modals/forms/add/restaurantEvent";

import type { IPageState } from "components/interface";

// ***************************************************************************************************************

type itemType = "restaurant" | "event";

type additionType = `adding-${itemType}`;

const defaultRestaurant: restaurantType = {
    created_at: new Date(),
    updated_at: new Date(),
    location: null,
    Delivery_Locations: null,
    Restaurant_Hours: [],
    name: "Restaurante",
    restaurant_id: -1,
    thumbnail_url: null,
    ttd: 15,
    ttp: 25,
    Products: [],
    Restaurant_Events: [],
    _count: {
        Orders: 0,
        Products: 0
    },
};

function BackOfficeRestaurantPage(props: ComponentProps<"main">) {
    const {
        get,
        state: appState,
    } = useApp();

    const { show } = useModal();

    const [page, updatePage] = useState<IPageState<undefined, additionType>>({
        data: undefined,
        error: null,
        status: "idle"
    });

    const { 
        status: pageStatus
    } = page;

    const assertions = {
        "isAddingRestaurant": (pageStatus === "adding-restaurant"),
        "isAddingRestaurantEvent": (pageStatus === "adding-event"),
        "isLoading": (pageStatus === "loading")
    };

    function openEventCreationModal() {
        show(<AddRestaurantEventForm />, {
            title: `Marcar evento`
        });
    };

    function toggleAddition(e: MouseEvent<HTMLButtonElement>) {
        updatePage(p => {
            return {
                ...p,
                pageStatus: (p.status === "adding-restaurant") ? "idle" : "adding-restaurant"
            }
        });
    };

    return <main {...props}>
        <section>
            <header className="w-full flex flex-row justify-between items-center">
                <h1>Restaurantes</h1>

                <Button onClick={toggleAddition} variant={(assertions.isAddingRestaurant) ? "primary" : "secondary"}>
                    {(assertions.isAddingRestaurant) ? <Icon name="Close" /> : <Icon name="Plus" />}
                </Button>
            </header>

            {(assertions.isLoading) && <div className="w-full flex flex-row justify-center items-center gap-2 p-10">
                <Icon name="Loading" className="animate-spin" />
            </div>}

            {(assertions.isAddingRestaurant) && <RestaurantForm
                restaurant={defaultRestaurant}
                onSuccess={() => updatePage(p => { return { ...p, pageStatus: "idle" } })}
            />}

            <div data-grid="RestaurantCard">
                {get("Restaurants")?.map(r => <RestaurantCard key={r.restaurant_id} restaurant={r} mode="admin" />)}
            </div>
        </section>

        <section>
            <header className="w-full flex flex-row justify-between items-center">
                <h1>Eventos</h1>

                <Button onClick={openEventCreationModal} variant={assertions.isAddingRestaurantEvent ? "primary" : "secondary"}>
                    <Icon name="Plus" />
                </Button>
            </header>

            {((["adding-Restaurant_Events"] as (typeof appState)[]).includes(appState))
                ? <div className="w-full flex flex-row justify-center items-center gap-2 p-10">
                    <Icon name="Loading" className="animate-spin" />
                </div>

                : <RestaurantEventList mode="list" />
            }
        </section>
    </main>
};

export default BackOfficeRestaurantPage;