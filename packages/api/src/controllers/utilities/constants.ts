import { API_MAX_TIME_SESSION_TOKEN } from 'utilities/constants';

import env from 'env';

import type { 
    CookieOptions
} from 'express';

// ***************************************************************************************************************

export const DEFAULT_COOKIES_OPTIONS: CookieOptions = {
    httpOnly: true,
    maxAge: API_MAX_TIME_SESSION_TOKEN,
    sameSite: 'strict',
    secure: false//(env.NODE_ENV !== 'development')
};