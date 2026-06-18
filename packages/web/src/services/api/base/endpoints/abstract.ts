import { CrossPlatformStorageManager } from "services/storage/managers";
 
import type { 
    ClientRequestService
} from "@Madeirense/shared";

// ***************************************************************************************************************

class BaseAPIAbstractEndpoint {
    public client;
    public storage;

    constructor(
        client: ClientRequestService,
        storage?: CrossPlatformStorageManager
    ) {
        this.client = client;
        this.storage = storage;
    }
};

export default BaseAPIAbstractEndpoint;