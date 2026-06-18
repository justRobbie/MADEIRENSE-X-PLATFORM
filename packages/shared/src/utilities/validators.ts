import { 
    ALLOWED_SPECIAL_CHARACTERS, 
    RANGES
} from "./constants.js";

// ***************************************************************************************************************

type sequenceType = (
    | "Password"
);

type withPattern<pattern extends string> = `With ${pattern}`;

export type validationType = (
    | "Password"
    | "PhoneNumber"
    | "HH:MM"
    | withPattern<(
        | "At least 1 number"
        | "At least 1 special character"
    )>
);

const escapedAllowedCharacters = (ALLOWED_SPECIAL_CHARACTERS ?? '').replace(/[\\\]^-]/g, '\\$&');

export const stringRegularExpressions: Map<validationType, string> = new Map([
    ["HH:MM", "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"],
    ["Password", `^(?=.*[A-Za-z])(?=.*\\d)(?=.*[${escapedAllowedCharacters}])[A-Za-z\\d${escapedAllowedCharacters}]+.{6,}$`],
    ["PhoneNumber", `^(\\+?\\d{1,4}\\s?)?\\d{${RANGES["password-length"].min},${RANGES["password-length"].max}}$`],
    ["With At least 1 number", `^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d${escapedAllowedCharacters}]+$`],
    ["With At least 1 special character", `^(?=.*[${escapedAllowedCharacters}])[A-Za-z\\d${escapedAllowedCharacters}]+$`],
]);

const regularExpressions: Map<validationType, { expression: RegExp, toString: () => string }> = new Map([
    ["HH:MM", {
        expression: new RegExp(stringRegularExpressions.get("HH:MM") as string),
        toString: () => stringRegularExpressions.get("HH:MM") as string
    }],
    ["Password", {
        expression: new RegExp(stringRegularExpressions.get("Password") as string),
        toString: () => stringRegularExpressions.get("Password") as string
    }],
    ["PhoneNumber", {
        expression: new RegExp(stringRegularExpressions.get("PhoneNumber") as string),
        toString: () => stringRegularExpressions.get("PhoneNumber") as string
    }],
    ["With At least 1 number", {
        expression: new RegExp(stringRegularExpressions.get("With At least 1 number") as string),
        toString: () => stringRegularExpressions.get("With At least 1 number") as string
    }],
    ["With At least 1 special character", {
        expression: new RegExp(stringRegularExpressions.get("With At least 1 special character") as string),
        toString: () => stringRegularExpressions.get("With At least 1 special character") as string
    }]
]);

export function testString(t: validationType | `${sequenceType} Sequence`, v: any): boolean {
    switch (t) {
        case "HH:MM": return regularExpressions.get(t)?.expression.test(v) ?? false;
        case "Password": return regularExpressions.get(t)?.expression.test(v) ?? false;
        case "Password Sequence": return [
            regularExpressions.get("With At least 1 number")?.expression.test(v) ?? false,
            regularExpressions.get("With At least 1 special character")?.expression.test(v) ?? false
        ].every(v => v);
        case "PhoneNumber": return regularExpressions.get(t)?.expression.test(v) ?? false;
        case "With At least 1 number": return regularExpressions.get(t)?.expression.test(v) ?? false;
        case "With At least 1 special character": return regularExpressions.get(t)?.expression.test(v) ?? false;

        default: throw new Error(`Validator of type ${t} isn't registered`);
    }
};

/**
 * Checks if the lengths of the provided arrays match.
 * @param arr - First array containing anything.
 * @param _arr - Second array containing anything.
 * @returns {boolean}
 */
export const doArraysLengthMatch = (arr: never[], _arr: never[]): boolean => { return (arr.length === _arr.length) };

export const isEmpty = (value: any) => {
    switch (typeof value) {
        case "object":
            if (Array.isArray(value)) return value.length === 0;

            return Object.keys(value).length === 0;

        case "string":
            return value === "";

        default: return true;
    };
};

/**
 * Returns true if value is invalid, it is considered invalid when it's undefined, null or NaN.
 * @param value Any value accepted in JS
 * @returns {boolean}
 */
export const isInvalidValue = (value: any) => { return [null, undefined, NaN].includes(value) };

/**
 * Returns true if value is numeric.
 * @param value Any value accepted in JS
 * @returns {boolean}
 */
export const isNumeric = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);

/**
 * Returns true if value is invalid, it is considered invalid when it's undefined, null or NaN.
 * @param value Any value accepted in JS
 * @returns {boolean}
 */
export const isTruthful = (value: any) => { return !isInvalidValue(value) };

/**
 * Search an object exhaustively (using recursion) and returns true if all of the property values are valid, false if otherwise.
 * @param obj 
 * @returns {boolean}
 */
export const isValidObject = (obj: Record<any, any>): boolean => {
    return Object.keys(obj).every(key => {
        switch (typeof (obj[key])) {
            case 'symbol': case 'boolean': case 'function': return true;

            case 'object':
                if (Array.isArray(obj[key])) return true;
                else return isValidObject(obj[key]);

            default: return !isInvalidValue(obj[key]);
        }
    });
};

/**
 * Insensitively compares strings using toUppercase function.
 * @param strA 
 * @param strB 
 * @returns {boolean}
 */
export const strMatch = (strA: string, strB: string) => { return strA.toUpperCase() === strB.toUpperCase() };