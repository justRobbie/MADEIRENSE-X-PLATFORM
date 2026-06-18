import { calculateDistance } from "./calculators.js";
import { parseAddressComponents } from "./parsers.js";
import { ELocationErrorCode } from "./enumerators.js";

import type { ILocator } from "../interfaces.js";

import type { 
    distanceVectorType, 
    googleAPIOptionsType
} from "../types.js";

import type { restaurantType } from "../types/restaurants.js";

// ***************************************************************************************************************

export type parsedGoogleAddressObjectType = {
    street_number: string,
    street_name: string,
    neighborhood: string,
    city: string,
    state: string,
    country: string,
    postal_code: string,
    address: string,
}

/**
 * Returns address information based on Latitude and Longitude.
 * @typedef {Object} Location
 * @property {number} lat - Latitude of the location.
 * @property {number} lng - Longitude of the location.
 * @returns string
 */
export const getAddressFromCoordinatesAPI = async (
    { latitude, longitude }: Readonly<distanceVectorType>, 
    parse: boolean = false, 
    { API_KEY }: Readonly<googleAPIOptionsType>
): Promise<string | parsedGoogleAddressObjectType> => {
    if (API_KEY === "") throw new Error('Google API key is not defined');

    const URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`

    try {
        const response = await fetch(URL)
        const data = await response.json()

        if (data.status === 'OK' && data.results.length > 0) {
            if (!parse) return data.results[0].formatted_address

            else return parseAddressComponents(data.results[0]);
        } else {
            throw new Error(`Geocoding failed: ${data.status}`)
        }
    } catch (error) {
        console.error('Geocoding error:', error);

        throw error
    }
}

/**
 * Get the user's current location using the browser's Geolocation API
 * @param options Configuration options for geolocation
 * @returns Promise that resolves with location data or rejects with error
 */
export function getCurrentLocation(options?: Readonly<PositionOptions>): Promise<ILocator> {
    return new Promise((resolve, reject) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            reject({
                code: ELocationErrorCode.NOT_SUPPORTED,
                message: 'Geolocation is not supported by this browser'
            });
            return;
        }

        const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 300000, // 5 minutes
            ...options
        };

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error: GeolocationPositionError) => {
                let errorMessage: string;

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                    default:
                        errorMessage = 'Unknown error occurred';
                        break;
                }

                reject({
                    code: error.code,
                    message: errorMessage
                });
            },
            defaultOptions
        );
    });
}

/**
 * Get location with error handling and user-friendly messages
 * @param options Geolocation options
 * @returns Promise with location result or null if failed
 */
export async function getLocationSafely(options?: Readonly<PositionOptions>): Promise<ILocator | null> {
    try {
        const location = await getCurrentLocation(options);
        return location;
    } catch (error) {
        console.error('Failed to get location:', error);
        return null;
    }
}

/**
 * Get all restaurants sorted by distance (nearest first)
 * @param userLocation User's current location
 * @param restaurants Array of available restaurants
 * @returns Restaurants sorted by distance with distance included
 */
export function getRestaurantsByDistance(
    userLocation: Readonly<distanceVectorType>,
    restaurants: ReadonlyArray<restaurantType>
): Array<restaurantType & { distance: number }> {
    return restaurants
        .map(restaurant => ({
            ...restaurant,
            distance: calculateDistance(userLocation, {
                latitude: parseFloat(restaurant.Delivery_Locations?.latitude.toString() ?? "0"),
                longitude: parseFloat(restaurant.Delivery_Locations?.longitude.toString() ?? "0"),
            })
        }))
        .sort((a, b) => a.distance - b.distance);
}