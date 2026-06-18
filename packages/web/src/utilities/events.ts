import { 
    type ChangeEvent
} from "react";

// ***************************************************************************************************************

export function extractBase64FromInput(
    inputEvent: ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string | null, error: string | null) => void
): void {
    const target = inputEvent.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
        callback(null, 'No file selected');
        return;
    }

    if (!file.type.startsWith('image/')) {
        callback(null, 'Selected file is not an image');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
        callback(e.target?.result as string, null);
    };

    reader.onerror = function () {
        callback(null, 'Error reading file');
    };

    reader.readAsDataURL(file);
};