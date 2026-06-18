import { Router } from 'express';

import { 
    body
} from 'express-validator';

import { 
    API_MIN_ID_NUMBER
} from '../utilities/constants';

import {
    onlyAllowUserRoles,
    validateJWT,
} from '../middlewares/authorization';

import {
    Validate,
} from '../middlewares/validation';

import * as controller from '../controllers/pushNotifications';

// ***************************************************************************************************************

const notificationValidation = [
    body('payload').isObject().withMessage('Notification must have a payload specification'),
    body('payload.notificationId').notEmpty().contains("MXP$", { minOccurrences: 1 }).withMessage('You must specify a notificationId with the MXP$ pattern'),
    body('payload.data').isObject().withMessage('Notification data must be an object'),
];

const v1 = Router();

v1.use(validateJWT as any); // ========================================================================

v1.post(
    '/push',
    onlyAllowUserRoles([
        "Admin"
    ]) as any,
    [
        body('user_id').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Target user id must be a positive integer'),
        ...notificationValidation,
        Validate.Handle.error
    ],
    controller.API$push as any
);

v1.post(
    '/batch/push',
    onlyAllowUserRoles([
        "Admin"
    ]) as any,
    [
        body('user_ids').isArray({ min: 2 }).withMessage('Must specify at least 2 or more users'),
        body('user_ids.*').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Target user id must be a positive integer'),
        ...notificationValidation,
        Validate.Handle.error
    ],
    controller.API$BATCH$push as any
);

v1.post(
    '/subscribe',
    [
        body('endpoint').notEmpty().withMessage('You must specify a subscription endpoint'),
        body('expirationTime').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Expiration timestamp must be a positive integer').custom(Validate.Custom.timestamp),
        body('keys').optional({ values: 'falsy' }).isObject().withMessage('Authentication keys are expected in an object'),
        body('keys.auth').optional({ values: 'falsy' }).isString().withMessage('auth expects a string token'),
        body('keys.p256dh').optional({ values: 'falsy' }).isString().withMessage('p256dh expects a string token'),
        Validate.Handle.error
    ],
    controller.subscribe as any
);

v1.delete(
    '/unsubscribe/:id',
    controller.unsubscribe as any
);

v1.delete(
    '/unsubscribe-all/:id',
    controller.unsubscribeAll
);

const pushNotificationRoutes = {
    v1
};

export default pushNotificationRoutes;