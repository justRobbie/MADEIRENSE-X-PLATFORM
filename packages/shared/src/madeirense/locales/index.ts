import enMonths from "./App/en.months.js";
import enStrings from "./App/en.strings.json" with { type: "json" };
import enUploadCare from "./UploadCare/en.js";

import ptMonths from "./App/pt.months.js";
import ptStrings from "./App/pt.strings.json" with { type: "json" };
import ptUploadCare from "./UploadCare/pt.js";

// ***************************************************************************************************************

export const locales = new Map([
    ["en", {
        months: enMonths,
        strings: enStrings,
        uploadCare: enUploadCare
    }],
    ["pt", {
        months: ptMonths,
        strings: ptStrings,
        uploadCare: ptUploadCare
    }],
]);