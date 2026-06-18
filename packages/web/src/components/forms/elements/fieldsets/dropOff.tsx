import {
    useState,
    type ComponentProps
} from "react";

import {
    getAddressFromCoordinatesAPI,
    type distanceVectorType,
    type parsedGoogleAddressObjectType,
} from "@Madeirense/shared";

import env from "env";

import GoogleMapLocationPicker from "components/maps/google/locationPicker";

import Icon from "components/icon";

// ***************************************************************************************************************

export namespace DropOffFieldset$Types {
    export type location = { latitude: number, longitude: number } & parsedGoogleAddressObjectType;
};

interface IPropTypes extends ComponentProps<"fieldset"> {
    DEBUG?: boolean;
    defaultName?: string;
    defaultSpecialInstructions?: string;
    hideLegend?: boolean;
    initialLocation?: distanceVectorType;
    legendLabel?: string;
    onLocationSelect?: (address: DropOffFieldset$Types.location) => void;
    presetName?: string;
    save?: boolean;
};

const API_KEY = env.GOOGLE_API_KEY;

function GoogleDropOffFieldset(_props: IPropTypes) {
    const {
        DEBUG = false,
        defaultName = undefined,
        defaultSpecialInstructions = undefined,
        hideLegend = false,
        initialLocation,
        legendLabel = "Localização",
        onLocationSelect,
        presetName = undefined,
        save = false,
        ...props
    } = _props;

    const [address, setAddress] = useState<parsedGoogleAddressObjectType | null>(null);
    const [dropOffLocation, updateLocation] = useState<distanceVectorType | undefined>(initialLocation);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAddress, toggleShowAddress] = useState<boolean>((defaultName !== undefined) ? true : false);

    const handleLocationSelect = async (location: distanceVectorType) => {
        updateLocation(location)

        try {
            setLoading(true);
            setError(null);

            const _address = await getAddressFromCoordinatesAPI(location, true, { API_KEY });

            onLocationSelect?.({
                ...(_address as parsedGoogleAddressObjectType),
                ...location
            });

            setAddress(_address as parsedGoogleAddressObjectType);
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };


    switch (API_KEY) {
        case "": {
            console.error("Google Maps API key is not set. Please set VITE_APP_GOOGLE_API_KEY in your environment variables.");

            return <fieldset {...props}>
                {!hideLegend && <legend>{legendLabel}</legend>}

                <GoogleMapLocationPicker />
            </fieldset>
        };

        default: {
            return <fieldset {...props}>
                {!hideLegend && <legend>{legendLabel}</legend>}

                <GoogleMapLocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={dropOffLocation}
                />

                {!save && <label className='flex flex-row justify-start items-center gap-2'>
                    <input type="checkbox" defaultChecked={defaultName !== undefined} name="save_dropoff_location" id="save_dropoff_location" onChange={({ target }) => toggleShowAddress(target.checked)} />

                    Salvar endereço?
                </label>}

                {error && <div data-state="error" className='w-full p-3 flex flex-row justify-start items-center gap-2'>
                    <Icon name="ExclamationCircle" />

                    {error.message}
                </div>}

                {(save || showAddress) && <div className='flex flex-row justify-start items-start gap-2 w-full'>
                    <label className='w-1/3'>
                        {presetName === "Casa" && <Icon name="Home" className='inline-block mr-2' />}
                        {presetName === "Trabalho" && <Icon name="Work" className='inline-block mr-2' />}

                        <span>Nome</span>

                        <br />

                        <input defaultValue={defaultName ?? ""} type="text" name="delivery_location_name" id="delivery_location_name" className='w-full' placeholder='Casa, Trabalho...' required {...(presetName ? { readOnly: true, value: presetName } : {})} />
                    </label>

                    <label className='w-full'>
                        <div className='flex flex-row justify-start items-center gap-2'>
                            <span>Endereço</span>

                            {loading && <Icon name="Loading" className="animate-spin" />}
                        </div>

                        <input type="text" name="delivery_location_address" id="delivery_location_address" className='w-full' readOnly placeholder='Preenchido automáticamente' value={address?.address} />
                    </label>
                </div>}

                <label htmlFor="delivery_special_instructions">Direções ou indicações? (Opcional)</label>

                <textarea defaultValue={defaultSpecialInstructions ?? ""} id="delivery_special_instructions" name="delivery_special_instructions" placeholder="Direções, ponto de referência, cuidados..." rows={2} className='w-full' />

                <input type="hidden" name="latitude" value={dropOffLocation?.latitude ?? 0} required />
                <input type="hidden" name="longitude" value={dropOffLocation?.longitude ?? 0} required />
            </fieldset>
        }
    };
};

export default GoogleDropOffFieldset;