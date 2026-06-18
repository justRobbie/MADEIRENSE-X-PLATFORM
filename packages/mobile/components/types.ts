import { 
    QueueStates, 
    Statuses
} from "utilities/enumerators";

import { 
    ComponentShapes,
    ComponentSizes,
    StyleVariants
} from "./utilities/enumerators";

// ***************************************************************************************************************

export type queuefied<T> = (T & { 
    state?: workQueueStateType 
});

export type sizeType = keyof typeof ComponentSizes;

export type shapeType = keyof typeof ComponentShapes;

export type stateType<Data, CustomState extends string> = { 
    status: statusType<CustomState>,
    data: Error | Data | null
};

export type statusType<Status extends string = ""> = (
    | (keyof typeof Statuses)
    | Status
);

export type variantType = keyof typeof StyleVariants;

export type withVariant<Props> = Props & { variant?: variantType };

export type workQueueStateType = keyof typeof QueueStates;