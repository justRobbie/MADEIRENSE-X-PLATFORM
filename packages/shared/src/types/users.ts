import type {
    Blocked_Users,
    Users,
    Workstations
} from "@Madeirense/database/browser";

import type { restaurantType } from "./restaurants.js";

// ***************************************************************************************************************

export type driverType = (
    Users &
    {
        Workstations: ReadonlyArray<Partial<Workstations>>
    }
);

export type staffMemberType = (
    Workstations &
    {
        Users: (
            Users &
            {
                Blocked_Users: ReadonlyArray<Blocked_Users>
            }
        ),
        Restaurants: restaurantType
    }
);