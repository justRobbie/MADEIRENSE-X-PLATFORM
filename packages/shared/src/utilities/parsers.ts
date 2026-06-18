import { PHONE_CODES } from "./constants.js";
import { isInvalidValue } from "./validators.js";

// ***************************************************************************************************************

interface addressComponent {
    long_name: string
    short_name: string
    types: string[]
}

interface geocodingResult {
	address_components: addressComponent[]
	formatted_address: string
	geometry: {
		location: { lat: number, lng: number }
		location_type: string
		viewport: {
			northeast: { lat: number, lng: number }
			southwest: { lat: number, lng: number }
		}
	}
	place_id: string
	types: string[]
};

/**
 * Parses address components from a Google Geocoding API result.
 * @typedef {Object} Location
 * @property {number} lat - Latitude of the location.
 * @property {number} lng - Longitude of the location.
 * @returns string
 */
export const parseAddressComponents = (result: geocodingResult) => {
    const components = result.address_components

    const getComponent = (type: string): string => {
        const component = components.find(comp => comp.types.includes(type))
        return component?.long_name || ''
    }

    return {
        street_number: getComponent('street_number'),
        street_name: getComponent('route'),
        neighborhood: getComponent('sublocality_level_1'),
        city: getComponent('locality'),
        state: getComponent('administrative_area_level_1'),
        country: getComponent('country'),
        postal_code: getComponent('postal_code'),
        address: result.formatted_address
    }
};

/**
 * Returns a new object containing the properties contained within the list.
 * @param obj 
 * @param propertiesList List of known properties to extract from the object. If the property is not contained in the object, then it it's simply ignored.
 * @returns {object}
 */
export const parseObjectProperties = (obj: object, propertiesList: string[]): object => {
	return Object.fromEntries(new Map(Object.entries(obj).filter((kvPair) => propertiesList.includes(kvPair[0]))));
};

/**
 * Removes the phone code from a phone number and returns it.
 * @param phone 
 * @returns string
 */
export const parsePhoneCode = (phone: string) => {
    const p = phone.replace(/\s+/g, '');

    const index = PHONE_CODES.map(({ code }) => code).findIndex(code => p.startsWith(code) || p.startsWith(code.substring(1)));

    if (index === -1) return "";

    return PHONE_CODES[index].code;
};

/**
 * Removes the phone code from a phone number and returns the number.
 * @param phone 
 * @returns string
 */
export const parsePhoneNumber = (phone: string) => {
    const p = phone.replace(/\s+/g, '');

    const index = PHONE_CODES.map(({ code }) => code).findIndex(code => p.startsWith(code) || p.startsWith(code.substring(1)));

    if (index === -1) return p;

    return p.substring(PHONE_CODES[index].code.length);
};

/**
 * Returns a string containing the properties and their values arranged on a fetch URL format.
 * @param obj 
 * @param separator `&` by default, used to concatenate values.
 * @returns {object}
 * 
 * @example 
 * // Correct usage of the function
 * const obj = { foo: 1, boo: "value", koo: 60, slug: [1, 2, 3, true, 'blah'] };
 * 
 * extractURLParamsFromObject(obj) // returns "foo=1&boo=value&koo=60&slug=1,2,3,true,blah";
 */
export const parseURLParamsFromObject = (obj: object, separator = '&') => Object.keys(obj)
	.filter(key => !isInvalidValue(((obj as Record<any, any>)[key])))
	.map(key => { return `${key}=${Array.isArray((obj as Record<any, any>)[key]) ? (obj as Record<any, any>)[key].join(',') : (obj as Record<any, any>)[key]}` })
	.join(separator);