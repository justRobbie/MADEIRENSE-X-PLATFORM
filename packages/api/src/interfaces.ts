import type { 
    authenticatedProfileType
} from '@Madeirense/shared';

import type { 
    IEventfulRequest
} from './middlewares/events.js';

// ***************************************************************************************************************

export interface IAuthenticatedRequest<
    Params = Record<string, string>,
    Body = any
> extends IEventfulRequest<Params, Body> {
    user?: authenticatedProfileType;
};