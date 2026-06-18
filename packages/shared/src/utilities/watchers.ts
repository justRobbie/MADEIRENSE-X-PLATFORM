import { 
    ILocator, 
    ILocatorError
} from "../interfaces.js";

// ***************************************************************************************************************

class Watcher {
    private watcherId: number;

    constructor () {
        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported');
        }

        this.watcherId = -1;
    }

    getId = () => this.watcherId;
    setId = (id: number) => this.watcherId = id
}

export class LocationWatcher extends Watcher {
    constructor () {
        super()
    }

    /**
     * Watch user's location for continuous updates
     * @param callback Function called when location changes
     * @param errorCallback Function called when error occurs
     * @param options Geolocation options
     * @returns Watch ID that can be used to clear the watch
     */
    watch(
        callback: (location: ILocator) => void,
        errorCallback?: (error: ILocatorError) => void,
        options?: PositionOptions
    ): number {    
        const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 1 minute for watching
            ...options
        };
    
        this.setId(navigator.geolocation.watchPosition(
            (position: GeolocationPosition) => {
                callback({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                });
            },
            (error: GeolocationPositionError) => {
                if (errorCallback) {
                    errorCallback({
                        code: error.code,
                        message: error.message
                    });
                }
            },
            defaultOptions
        ));

        return this.getId();
    }
    
    /**
     * Clear location watching
     * @param watchId The ID returned by watchLocation
     */
    clear(): void {
        if (this.getId() === -1) throw new Error("There's no registered Watcher to be cleared");

        navigator.geolocation.clearWatch(this.getId());
    }
}