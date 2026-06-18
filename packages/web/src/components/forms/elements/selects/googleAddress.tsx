import {
    useCallback,
    useState,
    type ComponentPropsWithoutRef
} from "react";

import {
    LoadScript,
    Autocomplete,
    Libraries
} from "@react-google-maps/api";

import {
    getAddressFromCoordinatesAPI,
    resolveClassNames,
    type parsedGoogleAddressObjectType,
    type distanceVectorType,
} from "@Madeirense/shared";

import env from "env";

import Icon from "components/icon";

import styles from "./googleAddress.module.css";

// ***************************************************************************************************************

interface IPropTypes extends ComponentPropsWithoutRef<"div"> {
    DEBUG?: boolean;
    defaultValue?: string;
    onPick?: (address: parsedGoogleAddressObjectType & { latitude: number, longitude: number }) => void;
};

interface SelectedPlace {
    name: string;
    address: string;
    placeId: string;
    location: distanceVectorType;
    types: string[];
    businessStatus: google.maps.places.BusinessStatus;
    rating?: number;
    photos?: google.maps.places.PlacePhoto[];
};

const libraries: Libraries = ["places"];

const GoogleAddressSelect = (_props: IPropTypes) => {
    const {
        className,
        DEBUG = false,
        defaultValue = "",
        onPick,
        ...props
    } = _props;

    const API_KEY: string = env.GOOGLE_API_KEY;

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

    const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    }, []);

    const onPlaceChanged = useCallback(async () => {
        if (API_KEY === "") throw new Error("Google Maps API key is not set. Please set VITE_APP_GOOGLE_API_KEY in your environment variables.");

        if (!autocomplete) return;

        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) return alert('No location data available for this place');

        // Filter for restaurants/food establishments
        const isRestaurant = place.types?.some(type =>
            [
                'restaurant',
                'food',
                'meal_takeaway',
                'meal_delivery',
                'cafe',
                'bar'
            ].includes(type)
        );

        if (!isRestaurant) return alert('Please select a restaurant or food establishment');

        setSelectedPlace({
            name: place.name || '',
            address: place.formatted_address || '',
            location: {
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
            },
            placeId: place.place_id || '',
            types: place.types || [],
            businessStatus: place.business_status || google.maps.places.BusinessStatus.OPERATIONAL,
            rating: place.rating,
            photos: place.photos
        });

        onPick?.({
            ...(await getAddressFromCoordinatesAPI(
                {
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                },
                true,
                { API_KEY }
            ) as parsedGoogleAddressObjectType),
            address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng()
        })
    }, [API_KEY, autocomplete, onPick]);

    const $divProps = {
        className: resolveClassNames(styles.select),
        ...props
    };

    switch (API_KEY) {
        case "": {
            console.error("Google Maps API key is not set. Please set VITE_APP_GOOGLE_API_KEY in your environment variables.");

            const {
                className: cn,
                ...$dp
            } = $divProps;

            const _className = resolveClassNames(cn, "w-full p-3 flex flex-row justify-center items-center gap-2");

            return <div className={_className} data-state="error" {...$dp}>
                <Icon name="ExclamationCircle" />

                Error: Google Maps API key is missing.
            </div>
        };

        default: {
            return <LoadScript googleMapsApiKey={API_KEY} {...{ libraries }}>
                <div {...$divProps}>
                    <Autocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                        options={{
                            types: ['establishment'],
                            fields: [
                                'name',
                                'formatted_address',
                                'place_id',
                                'geometry',
                                'types',
                                'business_status',
                                'rating',
                                'photos'
                            ]
                        }}
                    >
                        <input type="text" name="google-address" placeholder="Restaurante..." required {...{ defaultValue }} />
                    </Autocomplete>

                    {DEBUG && selectedPlace && (
                        <div className="selected-place" style={{ marginTop: '16px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <h3>{selectedPlace.name}</h3>

                            <p><strong>Address:</strong> {selectedPlace.address}</p>
                            <p><strong>Place ID:</strong> {selectedPlace.placeId}</p>
                            <p><strong>Types:</strong> {selectedPlace.types.join(', ')}</p>

                            {selectedPlace.rating && <p><strong>Rating:</strong> {selectedPlace.rating}</p>}
                            
                            <p><strong>Status:</strong> {selectedPlace.businessStatus}</p>
                        </div>
                    )}
                </div>
            </LoadScript>
        }
    };
};

export default GoogleAddressSelect;