import { 
    type RefObject
} from "react";

import { PHONE_CODES } from "@Madeirense/shared";

// ***************************************************************************************************************

export function selectPhoneCode($selectRef: RefObject<HTMLSelectElement | null>) {
    return ({ target }: any) => {
        if ($selectRef.current === null) return;

        const phoneNumber = (target as HTMLInputElement).value;

        const index = PHONE_CODES.map(({ code }) => code).findIndex(code => phoneNumber.startsWith(code));

        if (index === -1) return;

        $selectRef.current.value = PHONE_CODES[index].code;
    }
};