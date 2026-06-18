import { toRadians } from "./transformers.js";

import type { distanceVectorType } from "../types.js";

// ***************************************************************************************************************

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Readonly<distanceVectorType>, point2: Readonly<distanceVectorType>): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1Rad = toRadians(point1.latitude);
    const lat2Rad = toRadians(point2.latitude);
    const deltaLatRad = toRadians(point2.latitude - point1.latitude);
    const deltaLonRad = toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Calculates the time needed to travel between two points on a Kawasaki motorcycle
 * @param point1 Starting point with latitude and longitude
 * @param point2 Ending point with latitude and longitude
 * @param avgSpeed Average speed in km/h (optional, defaults to typical Kawasaki average)
 * @returns Object containing distance, time, and speed information
 */
export function calculateTravel(
    point1: Readonly<distanceVectorType>, 
    point2: Readonly<distanceVectorType>,
    avgSpeed?: number
): {
    distance: number;
    timeHours: number;
    timeMinutes: number;
    speed: number;
} {
    // Typical Kawasaki motorcycle average speeds considering:
    // - City traffic: 30-50 km/h
    // - Highway: 80-120 km/h
    // - Mixed conditions: ~65 km/h average
    const AVG_SPEED = avgSpeed || 65; // km/h
    
    const distance = calculateDistance(point1, point2);
    const timeHours = distance / AVG_SPEED;
    const timeMinutes = timeHours * 60;
    
    return {
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        timeHours: Math.round(timeHours * 100) / 100,
        timeMinutes: Math.round(timeMinutes),
        speed: AVG_SPEED
    };
}

/**
 * Alternative function that returns just the estimated time in hours
 * @param point1 Starting point
 * @param point2 Ending point
 * @param avgSpeed Optional custom average speed
 * @returns Travel time in hours
 */
export function calculateTravelTime(
    point1: Readonly<distanceVectorType>, 
    point2: Readonly<distanceVectorType>,
    avgSpeed: number = 65
): number {
    const distance = calculateDistance(point1, point2);
    return distance / avgSpeed;
}