import { 
    type API$Types,
    type environmentType
} from "@Madeirense/shared";

// ***************************************************************************************************************

const environment = process.env.NODE_ENV as environmentType;

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
    GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY as string,
    GOOGLE_MAP_ID: process.env.EXPO_PUBLIC_GOOGLE_MAP_ID as string,
    UPLOAD_CARE_PUBLIC_KEY: process.env.EXPO_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
    VAPID_PUBLIC_KEY: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY as string,

    // APP Defaults
    LOG_ERROR: (process.env.EXPO_PUBLIC_LOG_ERROR === "true"),

    // APP Features


    // API
    API_URL: process.env.EXPO_PUBLIC_API_URL as string,
    API_VERSION: process.env.EXPO_PUBLIC_API_VERSION as API$Types.versionType,

    // Server
    MODE: environment
};

export default env;