import {
    checkLocationPermission,
    getCurrentLocation,
    ELocationErrorCode,
    type ILocator,
    type ILocatorError,
} from "@Madeirense/shared";

import {
    useEffect,
    useState
} from "react";

// ***************************************************************************************************************

const useCurrentLocation = () => {
    const [location, setLocation] = useState<ILocator | null>(null);

    useEffect(() => {
        async function _getCurrentLocation() {
            try {
                await checkLocationPermission();

                const location = await getCurrentLocation({
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000
                });

                setLocation(location);
            } catch (error) {
                console.error('Location error:', error);

                const ILocatorError = error as ILocatorError;

                switch (ILocatorError.code) {
                    case ELocationErrorCode.PERMISSION_DENIED:
                        console.error('Please enable location access to find nearby restaurants');
                        break;

                    case ELocationErrorCode.TIMEOUT:
                        console.error('Location request timed out. Please try again.');
                        break;

                    default:
                        console.error('Unable to get your location. Please check your settings.');
                        break;
                }

                return null;
            }
        }

        _getCurrentLocation();

        return () => { };
    }, []);

    return location;
};

export default useCurrentLocation;