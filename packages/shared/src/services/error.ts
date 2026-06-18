import { API$Types } from "./types.js";

// ***************************************************************************************************************

export type APIErrorType = {
    message: string;
    method?: string;
    code?: string;
    status?: number;
    endpoint?: string;
};

/**
 * # API Error Extension
 * 
 * - Type: `helper class`
 * - Version: `1.0`
 * - Author: **SPKTR**
 *   - _Roberto César Ferreira de Carvalho_
 * 
 * ---
 * 
 * ## Meta
 * 
 * The current version adds:
 * 
 * - Properties:
 *   - `code`, any custom code that represent the current exception.
 *   - `status`, {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status | HTTP response status codes} that resulted in the current exception being thrown. 
 *   - `endpoint`, the endpoint that resulted in the exception being thrown.
 * 
 * ---
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error | `ErrorConstructor` }
 */
export class APIError<data, errorCode extends string = ""> extends Error {
    code?: string;
    status?: number;
    endpoint?: string;
    method?: string;
    response?: API$Types.response<data, errorCode>;

    constructor(error: APIErrorType, response?: API$Types.response<data, errorCode>) {
        super(error.message);
        this.name = APIError.name;
        this.code = error.code;
        this.status = error.status;
        this.endpoint = error.endpoint;
        this.method = error.method;
        this.response = response;

        Error.captureStackTrace?.(this, APIError);
    }
};