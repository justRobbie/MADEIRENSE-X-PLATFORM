import { Router } from 'express';

import { 
    body
} from 'express-validator';

import { 
    type Courier_Positions
} from '@Madeirense/database';

import { 
    API_MIN_ID_NUMBER
} from '../utilities/constants';

import {
    onlyAllowUserRoles,
    validateJWT,
} from '../middlewares/authorization';

import { 
    Validate, 
    validateId
} from '../middlewares/validation';

import * as controller from '../controllers/courierPositions';

// ***************************************************************************************************************

const v1 = Router();

v1.use(validateJWT as any); // ========================================================================

v1.get(
    '/me',
    onlyAllowUserRoles([
        'Driver'
    ]) as any,
    controller.getCurrentPosition as any
);

v1.get(
    '/order/:id',
    validateId,
    controller.getCourierPositionByOrder as any
);

enum ForbiddenFields {
    'courier_id' = 'courier_id',
    'position_id' = 'position_id',
    'recorded_at' = 'recorded_at',
};

v1.patch(
    '/ping/:id',
    onlyAllowUserRoles([
        'Admin',
        'Driver'
    ]) as any,
    validateId,
    [
        Validate.Body.Custom.forbiddenFields([
            'courier_id',
            'position_id',
            'recorded_at'
        ] as (keyof typeof ForbiddenFields)[]),
        Validate.Body.Custom.requireAtLeastOneField([
            'latitude',
            'longitude',
            'speed_kph'
        ] as (keyof Omit<Courier_Positions, (keyof typeof ForbiddenFields)>)[]),
        body('courier_id').optional({ values: 'falsy' }).isInt({ min: API_MIN_ID_NUMBER }).withMessage('Valid courier_id is required'),
        body('latitude').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required, value must be between -90/90'),
        body('longitude').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Valid latitude required, value must be between -180/180'),
        body('speed_kph').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Valid speed value is required, pass 0 is you want to indicated a full stop.'),
        Validate.Handle.error
    ],
    controller.ping as any
);

const courierPositionsRoutes = {
    v1
};

export default courierPositionsRoutes;