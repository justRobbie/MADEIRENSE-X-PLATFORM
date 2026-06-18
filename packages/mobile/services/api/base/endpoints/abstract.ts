import { CrossPlatformStorageManager } from "services/storage/managers";
 
import { 
    API$Enumerators,
    platformType,
    type ClientRequestService
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
        this.client.addHeaderProperties(
            {
                [API$Enumerators.Headers.platform]: "mobile" as platformType
            }
        );

        this.storage = storage;
    }
};

export default BaseAPIAbstractEndpoint;