import { 
    type ComponentProps
} from "react";

// ***************************************************************************************************************

export interface ISelectProps extends ComponentProps<"select"> {
    defaultOptionLabel?: string;
    defaultOptionValue?: ComponentProps<"option">["value"];
    hideDefaultOption?: boolean;
    withoutDefaultOption?: boolean;
};