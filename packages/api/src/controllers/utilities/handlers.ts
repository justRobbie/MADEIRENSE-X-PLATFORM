import { type API$Types } from "@Madeirense/shared";

import { 
    type Response
} from "express";

// ***************************************************************************************************************

export async function handleControllerError<code extends string = "">(
    response: Response<API$Types.response<any, code>>,
    error: unknown
) {
    switch (true) {
        default: return response.status(500).json({
            data: undefined,
            code: 'API_GENERIC_ERROR',
            httpStatus: 500,
            message: (error as Error).message,
            success: false,
        });
    }
};