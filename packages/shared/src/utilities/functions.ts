import { calculateDistance } from "./calculators.js"
import { checkBrowserFeatureSupport } from "./checkers.js";
import { getLocationSafely } from "./getters.js";

import { 
	isInvalidValue, 
	isTruthful, 
	strMatch
} from './validators.js';

import type { distanceVectorType } from "../types.js";

import type { restaurantType } from "../types/restaurants.js";

// ***************************************************************************************************************

/**
 * Returns the biggest number in the array.
 * @param {number[]} array
 * @returns {number}
 */
export const biggest = (array: never[]): number => {
	return ([].concat(array)).sort((a, b) => a - b).at(-1) as unknown as number
};

/**
 * Returns the smallest number in the array.
 * @param {number[]} array
 * @returns {number}
 */
export const smallest = (array: never[]): number => {
	return ([].concat(array)).sort((a, b) => a - b)[0] as number
};

/**
 * Returns either the supplied value or `null` when the value is invalid.
 * @param value Data to be evaluated.
 * @returns {any | null}
 */
export function coalesce<T>(value: T): (T | null) {
	return isInvalidValue(value) ? null : value;
};

/**
 * Returns the number of elapsed days between two dates.
 * @param dateA
 * @param dateB Will assume current date if not supplied.
 * @returns {number}
 */
export function daysBetweenDates(
	dateA: Date,
	dateB: Date = new Date()
): number {
	const ONE_DAY = 1000 * 60 * 60 * 24;

	dateA.setHours(0, 0, 0);
	dateB.setHours(0, 0, 0);

	return Math.round(Math.abs((dateA as any) - (dateB as any)) / ONE_DAY);
};

/**
 * Recursively Compares two objects by comparing each value of their properties.
 * - Avoid using this with complex or unknown objects.
 * @param a
 * @param b 
 * @returns {boolean}
 */
export const compareObjects = (a: Record<any, any>, b: Record<any, any>): boolean => {
	if (!a || !b) return false;

	let akeyArray = Object.keys(a), bkeyArray = Object.keys(b);

	if (akeyArray.length === 0 && bkeyArray.length === 0) return true;

	if ((akeyArray.length === 0 && bkeyArray.length > 0) || (akeyArray.length > 0 && bkeyArray.length === 0)) return false;

	return akeyArray.every(key => {
		let avalue = a[key], bvalue = b[key];

		if (!avalue || !bvalue) return false;

		switch (typeof (avalue)) {
			case 'object': return compareObjects(avalue, bvalue);

			default: return avalue === bvalue;
		}
	});
};

/**
 * (If found) Returns the first array found within an object and its properties.
 * @param obj 
 * @returns {any[] | null}
 */
export const findArrayInObject = (obj: Record<any, any>): any[] | null => {
	if (!obj || typeof (obj) !== 'object') return null;


	let foundArray = null;

	let objectKeys = Object.keys(obj).filter(key => (typeof (obj[key] === 'object')));


	for (let i = 0; i < objectKeys.length; i++) {
		let currentValue = obj[objectKeys[i]];

		foundArray = (Array.isArray(currentValue)) ? currentValue : findArrayInObject(currentValue);

		if (foundArray) break;
	};


	return foundArray;
};

/**
 * Returns the value of the property contained within the object, otherwise it returns `null` when the property isn't found.
 * @param obj 
 * @param propertyName The property is known or unknown.
 * @param caseSensitive The name comparison of properties is case insensitive, active this option if case sensitivity is necessary.
 * @returns {any | null}
 */
export function findPropertyValueInObject<T = any>(
	obj: Record<any, any>,
	propertyName: string,
	caseSensitive = false
): T | null {
	if (typeof (obj) !== 'object' || !obj || !propertyName) return null;

	let foundPropertyValue = null;

	let objectKeys = Object.keys(obj);

	const doStringsMatch = (stringA: string, stringB: string) => {
		return ((caseSensitive) ? (stringA === stringB) : strMatch(stringA, stringB));
	};

	for (let i = 0; i < objectKeys.length; i++) {
		let currentKey = objectKeys[i];

		foundPropertyValue = doStringsMatch(currentKey, propertyName)
			? obj[currentKey]
			: findPropertyValueInObject(obj[currentKey], propertyName, caseSensitive);

		if (foundPropertyValue) break;
	};

	return foundPropertyValue as T;
};

/**
 * Returns a new object without the properties contained within the list.
 * @param obj 
 * @param propertiesList List of known properties to extract from the object. If the property is not contained in the object, then it it's simply ignored.
 * @returns {object}
 */
export const removeObjectProperties = (obj: object, propertiesList: string[]): object => {
	return Object.fromEntries(new Map(Object.entries(obj).filter((kvPair) => !propertiesList.includes(kvPair[0]))));
};

/**
 * Return a new object with its property string names parsed by removing the full string pattern (if it exists) using `regex`.
 * - This function does not change the original object.
 * @param obj The target object.
 * @param {string} pattern The string pattern that will be filtered.
 * @param {boolean} goDeep If `true`, then the logic will recursively be applied to all depth levels.
 * @returns {object}
 * 
 * @example
 * 
 * const obj = {
 * 	"foo$some": "a",
 * 	"doo$other": "b",
 * 	"foo$another": "c",
 * 	"value": 1,
 * 	"boo#_something": 1,
 * };
 * 
 * console.log(
 * 	parseObjectPropertyNamesByPattern(obj, "foo$")
 * );
 * 
 * // Prints:
 * // { "some": "a", "doo$other": "b", "another": "c", "value": 1, "boo#_something": 1 }
 */
export const parseObjectPropertyNames = <T = object>(obj: object, pattern: string, goDeep: boolean = false): T => {
	return Object.fromEntries(new Map(Object.entries(obj).map((kvPair) => {
		const [
			key,
			value
		] = kvPair;

		const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		const regex = new RegExp(escaped, 'g');

		return [
			key.replace(regex, ''),
			(goDeep)
				? (typeof value === "object")
					? Array.isArray(value)
						? value
						: parseObjectPropertyNames(value, pattern, true)
					: value
				: value
		];
	}))) as T;
};

/**
 * Return a new object with its property string names parsed by removing every character before, and including, a given pattern. 
 * - This function does not change the original object.
 * 
 * It differs from {@link parseObjectPropertyNames} because it doesn't use regex to compare the property against the pattern, rather:
 * - determining if it exists via [`includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes), 
 * - separating the string using [`split`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split), 
 * - [`slicing`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) the array from the position after the first occurrence of the pattern 
 * - then concluding with a [`join`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join).
 * @param obj The target object.
 * @param {string} pattern The string pattern that will be filtered.
 * @param {boolean} goDeep If `true`, then the logic will recursively be applied to all depth levels.
 * @returns {object}
 * 
 * @example
 * 
 * const obj = {
 * 	"foo$some": "a",
 * 	"doo$other": "b",
 * 	"coo$another": "c",
 * 	"value": 1,
 * 	"boo#_something": 1,
 * };
 * 
 * console.log(
 * 	parseObjectPropertyNamesByPattern(obj, "$")
 * );
 * 
 * // Prints:
 * // { "some": "a", "other": "b", "another": "c", "value": 1, "boo#_something": 1 }
 */
export const parseObjectPropertyNamesByPattern = <T = object>(obj: object, pattern: string, goDeep: boolean = false): T => {
	return Object.fromEntries(new Map(Object.entries(obj).map((kvPair) => {
		const [
			key,
			value
		] = kvPair;

		const _key = key.includes(pattern) ? key : key.split(pattern).slice(1).join();

		return [
			_key,
			(goDeep)
				? (typeof value === "object")
					? Array.isArray(value)
						? value
						: parseObjectPropertyNames(value, pattern, true)
					: value
				: value
		];
	}))) as T;
};


/**
 * Pass several class names or variables containing classNames and get a string with all of them. Used to resolve the className prop in components that have classes by default.
 * @param classNames An array of class names whose values {@link isInvalidValue | might or might not be valid} or an empty string.
 * @returns {string} A string of class names.
 * 
 * @example
 * 
 * const className = undefined;
 * 
 * //Returns 'class1 class2'
 * resolveClassNames('class1', className, 'class2');
 */

export const resolveClassNames = (...classNames: (string | undefined | null)[]): string => { return classNames.filter(_class => { return isInvalidValue(_class) ? false : (_class !== '') }).join(' ') };

/**
 * Returns the first value that is truthful, otherwise returning `undefined` if all of them aren't.
 * @param values 
 * @returns {any | undefined}
 */
export const which = <T=any>(...values: T[]): T | undefined => values.find(isTruthful);

/**
 * Find the nearest restaurant to a given location
 * @param userLocation User's current location
 * @param restaurants Array of available restaurants
 * @returns The nearest restaurant or null if no restaurants provided
 */
export function findNearestRestaurant(
	userLocation: Readonly<distanceVectorType>,
	restaurants: ReadonlyArray<restaurantType>
): restaurantType | null {
	if (restaurants.length === 0) return null;

	let nearestRestaurant = restaurants[0];
	let shortestDistance = calculateDistance(userLocation, {
		latitude: parseFloat(restaurants[0].Delivery_Locations?.latitude.toString() ?? "0"),
		longitude: parseFloat(restaurants[0].Delivery_Locations?.longitude.toString() ?? "0"),
	});

	for (let i = 1; i < restaurants.length; i++) {
		const distance = calculateDistance(userLocation, {
			latitude: parseFloat(restaurants[i].Delivery_Locations?.latitude.toString() ?? "0"),
			longitude: parseFloat(restaurants[i].Delivery_Locations?.longitude.toString() ?? "0"),
		});

		if (distance < shortestDistance) {
			shortestDistance = distance;
			nearestRestaurant = restaurants[i];
		}
	}

	return nearestRestaurant;
};

export async function findNearestRestaurantWithLocation(restaurants: Readonly<restaurantType>[]) {
	const userLocation = await getLocationSafely();

	if (!userLocation) {
		console.log('Could not get user location, using default or asking user to select');
		return null;
	}

	// Use your existing findNearestRestaurant function
	const nearest = findNearestRestaurant(userLocation, restaurants);
	return nearest;
};

/**
 * As for a feature permission to the browser. Note that this function also checks if the feature is supported as a failsafe, so there's no need to do so before-hand.
 * @param feature A property of the global [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object.
 * @param callback Function to that's  called after permission response is returned.
 * @returns void
 */
export async function requestBrowserFeaturePermission(feature: (keyof (Window & typeof globalThis)), callback?: (arg: NotificationPermission) => void) {
	switch (feature) {
		case "Notification":
			if (!checkBrowserFeatureSupport(feature)) return false;

			let notification_permission = await Notification.requestPermission();

			switch (notification_permission as NotificationPermission) {
				case "default": console.error(`"Notification" feature permission remains default, the user probably took too long to accept/deny the prompt`); break;

				case "denied": console.error(`"Notification" feature permission was declined`); break;

				default: break;
			};

			callback?.(notification_permission as NotificationPermission);

			return notification_permission === "granted";

		default: return false;
	};
};