import MXP$App from "configurations";

import type { 
    CrossPlatformStorageManager
} from "services/storage/managers";

// ***************************************************************************************************************

export interface IProviderPropTypes {
    children: any;
    clients: typeof MXP$App.Base.Business.endpoints,
    storageManager?: CrossPlatformStorageManager
};