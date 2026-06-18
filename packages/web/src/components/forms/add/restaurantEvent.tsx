import { 
    useState,
    type ComponentProps,
    type SubmitEvent
} from "react";

import ReactPlayer from "react-player";

import {
    defineLocale,
    FileUploaderRegular
} from "@uploadcare/react-uploader";

import {
    formatUUID_UC_CDN_URL,
    locales
} from "@Madeirense/shared";

import env from "env";

import { useApp } from "contexts/App";

import Button from "components/buttons";
import Icon from "components/icon";

import AppSettings from "settings";

import RestaurantsSelector from "../elements/selects/restaurants";

import type { IComponentState } from "components/interface";

// ***************************************************************************************************************

interface IPropTypes extends ComponentProps<"form"> {
    callback?: () => void;
    hideTitle?: boolean,
};

type AssetType = "thumbnail" | "video";

type ModalState = {
    uploadedThumbnailURL?: string
    uploadedVideoURL?: string
};

const UPLOAD_CARE_PUBLIC_KEY = env.UPLOAD_CARE_PUBLIC_KEY;

defineLocale('pt', async () => {
    return locales.get("pt")?.uploadCare ?? {};
});

const AddRestaurantEventForm = ({ 
    callback, 
    hideTitle = false, 
    ...props
}: IPropTypes) => {
    const { create } = useApp();
    const [form, updateForm] = useState<IComponentState<ModalState, `uploading-${AssetType}`>>({
        data: {
            uploadedThumbnailURL: "",
            uploadedVideoURL: ""
        },
        status: "idle",
        error: null
    });

    const { data, error, status } = form;

    const isWorking = [
        "uploading-thumbnail",
        "uploading-video"
    ].includes(status);

    async function POST(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const $form = e.target as HTMLFormElement;
        const elements = $form.elements;

        try {
            updateForm(p => { return { ...p, status: "loading" } });

            if ([data?.uploadedThumbnailURL, data?.uploadedVideoURL].includes("")) throw new Error("O evento deve ter uma imagem de capa e um vídeo promocional");

            const _price = (elements.namedItem("price") as HTMLInputElement).value as string;
            const price = _price === "" ? 0 : parseFloat(`${_price}`);

            const _spots = (elements.namedItem("spots") as HTMLInputElement).value as string;
            const spots = _spots === "" ? 0 : parseFloat(`${_spots}`);

            await create({
                property: "Restaurant_Events",
                payload: {
                    restaurant_id: parseInt(`${(elements.namedItem("restaurant_id") as HTMLInputElement).value as string}`),
                    name: (elements.namedItem("name") as HTMLInputElement).value as string,
                    description: (elements.namedItem("description") as HTMLInputElement).value as string,
                    event_date: new Date((elements.namedItem("event_date") as HTMLInputElement).value as string),
                    end_time: (elements.namedItem("end_time") as HTMLInputElement).value as string,
                    start_time: (elements.namedItem("start_time") as HTMLInputElement).value as string,
                    thumbnail_url: data?.uploadedThumbnailURL ?? "",
                    video_url: data?.uploadedVideoURL ?? "",
                    price,
                    spots
                }
            });

            updateForm(p => { return { ...p, status: "idle" } });

            callback?.();
        } catch (error) {
            updateForm(p => { return { ...p, status: "error", error: new Error((error as Error).message) } });
        }
    };

    function toggleUploadState(type: ("thumbnail" | "video")) {
        return (e: any) => {
            switch (type) {
                case "thumbnail": updateForm(f => { return { ...f, status: "uploading-thumbnail", data: { ...f.data, uploadedThumbnailURL: "" } } }); break;
                case "video": updateForm(f => { return { ...f, status: "uploading-video", data: { ...f.data, uploadedVideoURL: "" } } }); break;

                default: throw new Error("Unknown upload type");
            }
        }
    };

    function handleUpload(type: ("thumbnail" | "video")) {
        return ({ uuid, mimeType, errors }: any) => {
            if (!uuid) {
                console.error(errors);

                throw new Error("Asset UUID is null, the upload possibly failed. Check the logs for more information");
            }

            switch (type) {
                case "thumbnail": updateForm(f => { return { ...f, status: "idle", data: { ...f.data, uploadedThumbnailURL: formatUUID_UC_CDN_URL(uuid) } } }); break;
                case "video": updateForm(f => { return { ...f, status: "idle", data: { ...f.data, uploadedVideoURL: `${formatUUID_UC_CDN_URL(uuid)}${mimeType.split("/").join(".")}` } } }); break;

                default: throw new Error("Unknown upload type");
            }
        }
    };

    return <form onSubmit={POST} className="h-ful w-full flex flex-col justify-start items-start gap-4 p-3" {...props}>
        {!hideTitle && <h2>Evento</h2>}

        <fieldset className="w-full flex flex-col justify-start items-start gap-2">
            <legend className="font-bold mb-2">Informação</legend>

            <label htmlFor="name" className="w-full text-left">
                <span>Nome</span>

                <br />

                <input id="name" type="name" name="name" placeholder="Nome..." className="w-full" required />
            </label>

            <label htmlFor="description" className="w-full text-left">
                <span>Descrição</span>

                <br />

                <textarea id="description" name="description" placeholder="Descrição..." className="w-full p-2" required />
            </label>
        </fieldset>

        <fieldset data-state={isWorking ? "disabled" : "idle"} className="w-full flex flex-col justify-start items-start gap-1 p-2 border rounded-md border-solid">
            <header className="w-full flex flex-row justify-between items-center">
                <h5>Imagem da capa</h5>

                <FileUploaderRegular
                    filesViewMode="grid"
                    multipleMin={1}
                    multipleMax={1}
                    localeName="pt"
                    onFileUploadStart={toggleUploadState("thumbnail")}
                    onFileUploadSuccess={handleUpload("thumbnail")}
                    pubkey={UPLOAD_CARE_PUBLIC_KEY as string}
                    sourceList="local, facebook, gdrive"
                    confirmUpload
                    gridShowFileNames
                    imgOnly
                    useCloudImageEditor
                />
            </header>

            {[
                status === "uploading-thumbnail",
                data?.uploadedThumbnailURL !== ""
            ].includes(true) && <div data-type="thumbnail" style={{ backgroundImage: `url(${data?.uploadedThumbnailURL})` }} className="w-full flex flex-col justify-center items-center rounded-md min-h-[300px] border">
                    {status === "uploading-thumbnail" && <Icon name="Loading" className="animate-spin" />}
                </div>}
        </fieldset>

        <fieldset data-state={isWorking ? "disabled" : "idle"} className="w-full flex flex-col justify-start items-start gap-2 p-2 border rounded-md border-solid">
            <header className="w-full flex flex-row justify-between items-center">
                <h5>Vídeo promocional</h5>

                <FileUploaderRegular
                    accept="video/mp4,video/webm,video/mov,video/avi"
                    filesViewMode="grid"
                    multipleMin={1}
                    multipleMax={1}
                    localeName="pt"
                    localeDefinitionOverride={AppSettings.UploadCare.Overrides.video}
                    onFileUploadStart={toggleUploadState("video")}
                    onFileUploadSuccess={handleUpload("video")}
                    pubkey={UPLOAD_CARE_PUBLIC_KEY as string}
                    sourceList="local, facebook, gdrive"
                    confirmUpload
                    gridShowFileNames
                />
            </header>

            {(status === "uploading-video") && <div className="w-full flex flex-col justify-center items-center rounded-md min-h-[300px] border">
                <Icon name="Loading" className="animate-spin" />
            </div>}

            {(data?.uploadedVideoURL !== "") && <ReactPlayer
                src={data?.uploadedVideoURL}
                width="100%"
                height={300}
                className="rounded-md border"
                playing
                controls
            />}
        </fieldset>

        <fieldset className="w-full flex flex-row justify-start items-start gap-2">
            <legend className="font-bold mb-2">Localização, Data e horário</legend>

            <label htmlFor="restaurant_id" className="w-full text-left">
                <span>Restaurante</span>

                <br />

                <RestaurantsSelector title="Restaurante" id="restaurant_id" name="restaurant_id" defaultOptionLabel="Local do evento" defaultValue={""} className="w-full" required hideDefaultOption />
            </label>

            <label htmlFor="event_date" className="w-full text-left">
                <span>Data do evento</span>

                <br />

                <input id="event_date" type="date" min={new Date().toISOString().split('T')[0]} name="event_date" placeholder="Data do evento" className="w-full" required />
            </label>

            <div className="flex flex-row justify-start items-center gap-2">
                <label htmlFor="start_time" className="text-left">
                    <span className="whitespace-nowrap">Hora de começo</span>

                    <br />

                    <input id="start_time" type="time" name="start_time" placeholder="Começo" />
                </label>

                <label htmlFor="end_time" className="whitespace-nowrap text-left">
                    <span>Hora do fim</span>

                    <br />

                    <input id="end_time" type="time" name="end_time" placeholder="Fim" />
                </label>
            </div>
        </fieldset>

        <fieldset className="w-full flex flex-row justify-start items-start gap-2">
            <legend className="font-bold mb-2">Preço de entrada e capacidade</legend>


            <div className="w-full flex flex-row justify-start items-center gap-2">
                <label htmlFor="price" className="w-full text-left">
                    <span>Preço <span className="italic opacity-45 text-sm">(Deixar vazio se o ingresso for grátis)</span></span>

                    <br />

                    <input id="price" type="number" min={0} name="price" placeholder="Preço" className="w-full" />
                </label>

                <label htmlFor="spots" className="text-left">
                    <span className="whitespace-nowrap">Capacidade <span className="italic opacity-45 text-sm">(Deixar vazio se não tiver limite)</span></span>

                    <br />

                    <input id="spots" type="spots" min={0} name="spots" placeholder="Capacidade" className="w-full" />
                </label>
            </div>
        </fieldset>

        <div className="flex flex-col justify-start items-start w-full gap-2 mt-auto">
            {error && <p data-state="error" className="w-full flex flex-row justify-start items-center gap-4">
                <Icon name="ExclamationCircle" />

                {error.message}
            </p>}

            <Button type="submit" className="w-full" disabled={status === "loading"}>
                Postar evento

                {status === "loading" && <Icon name="Loading" className="animate-spin" />}
            </Button>
        </div>
    </form>
};

export default AddRestaurantEventForm;