import {
    memo,
    useCallback,
    useState,
    type ComponentProps,
    type CSSProperties
} from "react";

import {
    GoogleMap,
    Marker,
    useJsApiLoader,
    type Libraries
} from "@react-google-maps/api";

import {
    Coordinates,
    resolveClassNames,
    type distanceVectorType
} from '@Madeirense/shared';

import env from "env";

import Button from "components/buttons";
import Icon from "components/icon";

import { GOOGLE_MARKERS } from "./constants";

import styles from "./locationPicker.module.css";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"div"> {
    containerStyle?: CSSProperties;
    DEBUG?: boolean;
    defaultCenter?: distanceVectorType;
    initialLocation?: distanceVectorType;
    onLocationSelect?: (location: distanceVectorType) => void;
    zoom?: number;
};

const API_KEY: string = env.GOOGLE_API_KEY;

const _defaultCenter: distanceVectorType = {
    latitude: Coordinates.MiddleOfLuanda.LAT,
    longitude: Coordinates.MiddleOfLuanda.LNG
};

const _defaultContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
};

const libraries: Libraries = ['places'];

function GoogleMapLocationPicker(_props: IPropTypes) {
    const {
        className,
        containerStyle = _defaultContainerStyle,
        DEBUG = false,
        defaultCenter = _defaultCenter,
        initialLocation,
        onLocationSelect = (location: distanceVectorType) => { },
        zoom = 10,
        ...props
    } = _props;

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<distanceVectorType>(initialLocation || defaultCenter);

    const {
        isLoaded,
        loadError = null
    } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: API_KEY,
        libraries
    });

    const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();

        const newLocation: distanceVectorType = {
            latitude,
            longitude
        };

        setSelectedLocation(newLocation)

        onLocationSelect?.(newLocation)
    }, [onLocationSelect])

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map)
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null)
    }, []);

    const centerOnCurrentLocation = useCallback(() => {
        if (navigator.geolocation && map) {
            navigator.geolocation.getCurrentPosition(
                (position: GeolocationPosition) => {
                    const currentLocation: distanceVectorType = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }
                    setSelectedLocation(currentLocation)

                    map.panTo({
                        lat: currentLocation.latitude,
                        lng: currentLocation.longitude
                    });

                    map.setZoom(30)

                    onLocationSelect?.(currentLocation)
                },
                (error: GeolocationPositionError) => {
                    console.error('Error getting current location:', error)
                }
            )
        }
    }, [map, onLocationSelect])

    const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();

        const newLocation: distanceVectorType = {
            latitude,
            longitude
        };

        setSelectedLocation(newLocation)

        onLocationSelect?.(newLocation);
    }, [onLocationSelect]);

    const assertions = {
        "isLoading": [
            !isLoaded
        ].includes(true),

        "hasError": [
            loadError !== null
        ].includes(true),

        "noAPIKey": (API_KEY === ""),
    };

    const $divProps = {
        className: resolveClassNames(styles.picker, className),
        ...props
    };

    switch (true) {
        case (assertions.noAPIKey): {
            console.error("Google Maps API key is not set. Please set VITE_APP_GOOGLE_API_KEY in your environment variables.");

            return <div data-state="error" {...$divProps}>
                <Icon name="ExclamationCircle" />

                Error: Google Maps API key is missing.
            </div>
        };

        case (assertions.hasError): return (<div data-state="error" {...$divProps}>
            <Icon name="ExclamationCircle" />

            Error loading maps: {loadError?.message}
        </div>);

        case (assertions.isLoading): return (<div data-state="loading" {...$divProps}>
            <Icon name="Loading" className='animate-spin' />
        </div>);

        default: {
            return <div {...$divProps}>
                <div data-section="map">
                    <div className={styles.controls}>
                        <Button shape="circle" onClick={centerOnCurrentLocation}>
                            <Icon name="MyLocation" className='text-lg' />
                        </Button>
                    </div>

                    <GoogleMap
                        center={{
                            lat: selectedLocation.latitude,
                            lng: selectedLocation.longitude
                        }}
                        mapContainerStyle={containerStyle}
                        onClick={handleMapClick}
                        options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                        }}
                        zoom={13}
                        {...{
                            onLoad,
                            onUnmount
                        }}
                    >
                        <Marker
                            position={{
                                lat: selectedLocation.latitude,
                                lng: selectedLocation.longitude
                            }}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                            icon={{
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(GOOGLE_MARKERS.PIN),
                                scaledSize: new window.google.maps.Size(30, 30),
                                anchor: new window.google.maps.Point(15, 15),
                            }}
                        />
                    </GoogleMap>
                </div>

                <div className="mt-2 text-sm text-gray-500 flex flex-row justify-between items-center">
                    {DEBUG && <div className="text-sm flex flex-row justify-normal items-center gap-3">
                        <span>Latitude: {selectedLocation.latitude.toFixed(6)}</span>
                        <span>Longitude: {selectedLocation.longitude.toFixed(6)}</span>
                    </div>}

                    <span className='italic ml-auto'>
                        💡 Selecciona qualquer lugar no mapa para marcares o local de entrega
                    </span>
                </div>
            </div>
        }
    }
}

export default memo(GoogleMapLocationPicker);