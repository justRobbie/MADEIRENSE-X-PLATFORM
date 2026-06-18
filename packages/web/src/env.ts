import { 
    type environmentType
} from "@Madeirense/shared";

// ***************************************************************************************************************

const environment = import.meta.env.MODE as environmentType;

/**
 * # Environment Helper
 * 
 * Contains accurately type data provided by the environment file, it also composes variables base on other values described in the files.
 * 
 * - Unless you're adding empty string or undefined values, _edit your default values in the primary environment files_.
 * - Add documentation via JSDocs to some of the configured environment variables.
 * - Create derived values based on environment values.
 */
const env = {
    // APP Keys
    GOOGLE_API_KEY: import.meta.env.VITE_APP_GOOGLE_API_KEY,
    GOOGLE_MAP_ID: import.meta.env.VITE_APP_GOOGLE_MAP_ID,
    UPLOAD_CARE_PUBLIC_KEY: import.meta.env.VITE_APP_UPLOAD_CARE_PUBLIC_KEY,
    VAPID_PUBLIC_KEY: import.meta.env.VITE_APP_VAPID_PUBLIC_KEY,

    // APP Defaults
    LOG_ERROR: import.meta.env.VITE_APP_LOG_ERROR,

    // APP Features


    // API
    API_URL: import.meta.env.VITE_APP_API_URL,
    API_VERSION: import.meta.env.VITE_APP_API_VERSION,

    // Server
    MODE: environment
};

export default env;