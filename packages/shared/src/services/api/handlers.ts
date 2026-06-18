import { APIError } from '../error.js';

// ***************************************************************************************************************

class APIHandler {
    dealWith<T = any>(error: unknown) {
        switch ((error as Error).name) {
            case APIError.name:
                const {
                    response
                } = error as APIError<T>;

                throw new Error(response?.message);

            default: throw new Error((error as Error).message);
        };
    };
};

export default APIHandler;