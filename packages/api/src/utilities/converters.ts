import { Prisma } from "@Madeirense/database";

// ***************************************************************************************************************

export function convertDecimals<T>(obj: T): T 
{
    if (
        (obj === null || obj === undefined) ||
        (obj instanceof Date)
    ) return obj;

    if (obj instanceof Prisma.Decimal) {
        return obj.toNumber() as T
    }

    if (Array.isArray(obj)) {
        return obj.map(convertDecimals) as T
    }

    if (typeof obj === 'object') {
        const converted: Record<string, any> = {}

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                converted[key] = convertDecimals(obj[key])
            }
        }

        return converted as T;
    }

    return obj;
};