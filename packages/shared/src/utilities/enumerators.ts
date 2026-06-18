export enum ApplicationStates {
    "Deprecated", 
    "Down", 
    "Under-Construction", 
    "Under-Maintenance",
    "Unknown",
    "Up",
};

export enum Carts {
    "delivery" = "delivery",
    "event" = "event",
    "resort" = "resort"
};

export namespace Coordinates {
    export enum MiddleOfLuanda {
        LAT = -8.839988,
        LNG = 13.289437
    }
};

export enum ELocationErrorCode {
    PERMISSION_DENIED = 1,
    POSITION_UNAVAILABLE = 2,
    TIMEOUT = 3,
    NOT_SUPPORTED = 4
};

export enum RestaurantRevenue {
    factual = "factual",
    total = "total"
};

export enum RuntimeErrors {
    /** Thrown when a component received the wrong child element through the `children` prop */
    FORBIDDEN_CHILDREN = "FORBIDDEN_CHILDREN",
};
