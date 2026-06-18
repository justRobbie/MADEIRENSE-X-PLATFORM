import { DB$Enumerators } from "./enumerators";

// ***************************************************************************************************************

export namespace DB$Types {
    export type actionCountRecord = Partial<Record<`${keyof typeof DB$Enumerators.Actions}Count`, number>>;

    export type tableCountRecord = Partial<Record<(keyof typeof DB$Enumerators.Tables), number>>;
};