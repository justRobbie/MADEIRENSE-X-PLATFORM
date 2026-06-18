import type { 
    IComponentState
} from "components/interface";

// ***************************************************************************************************************

export const DEFAULT_COMPONENT_STATE: IComponentState<any> = {
    data: null,
    status: "idle",
    error: null
};