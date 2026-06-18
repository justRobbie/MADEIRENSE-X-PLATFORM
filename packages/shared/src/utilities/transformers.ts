/**
 * Returns a string of elements separate by a comma.
 * @param array Any array that contains raw values (anything but an object).
 * @returns {string}
 */
export const arrayToString = (array: never[]) => { return `(${([].concat(array)).join((array.length === 1) ? '' : ', ')})` };

/**
 * Returns a tail function meant for filtering arrays with values of the specified type.
 * @param type The type of the value to be returned.
 * @returns {function}
 */
export const onlyType = (type: ("string" | "number" | "object")) => { 
	return (value: any) => typeof value === type;
};

/**
 * Returns an array of Key-Value pairs from the map.
 * @param map 
 * @returns {array}
 */
export const deconstruct__MAP = (map: Map<any, any>): [string, any][] => {
	let arr: any[] = [];

	map.forEach((value, key) => { arr.push([key, JSON.parse(JSON.stringify(value))]) });

	return arr;
};

export const mapWithId = <T extends object>(it: T, idx: number) => ({ ...it, id: idx });

/**
 * Choose whether to transform to lower or upper case.
 */
type caseSensitivityOptionsObjectType = {
    /** Transforms string to lower case */
    toLowerCase?: boolean,
    /** Transforms string to upper case */
    toUpperCase?: boolean
};

/**
 * Trims white space from a string.
 * @param str 
 * @param caseSensitivity Choose to trim and transform string to lower or upper case.
 * @returns {string}
 */
export const removeWhiteSpace = (str: string, caseSensitivity?: caseSensitivityOptionsObjectType) => {
	let { toLowerCase = false, toUpperCase = false } = caseSensitivity ?? {};

	switch (true) {
		case (toLowerCase): str = str.toLowerCase(); break;
		case (toUpperCase): str = str.toUpperCase(); break;

		default: break;
	};

	return str.toString().replace(/\s+/g, '');
};

/**
 * Removes duplicate values from array.
 * @param array Array containing any raw value.
 * @returns 
 */
export const removeArrayDuplicates = (array: never[]): never[] => {
	return array.filter((val, idx) => (idx === array.indexOf(val)));
};

export async function toBase64(file: File) {
    return await (blob => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })
    })(file) as string
};

export async function toBlob(base64String: string, mimeType = '') {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');

    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    
    return new Blob([byteArray], { type: mimeType });
};

export function toDateISO(date: Date, timeString: `${number}:${number}`) {
    const [hours, minutes] = timeString.split(':').map(Number);

    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    return newDate.toISOString();
};

export function toDayOfTheWeek(dotw: string) { return dotw.slice(0, 3) };

export function toTimeDecimal(hm: number) { return hm < 10 ? `0${hm}` : hm.toString() };

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
};

export function toUInt8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        ;

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray;
};