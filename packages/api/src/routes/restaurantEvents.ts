import { Router } from 'express';

import { body } from 'express-validator';

import {
    toDateISO
} from '@Madeirense/shared';

import {
    API_MAX_TEXT_REQUEST_LENGTH,
    API_MIN_ID_NUMBER
} from '../utilities/constants';

import {
    onlyAllowUserRoles,
    validateJWT,
} from '../middlewares/authorization';

import {
    Validate,
    validateId,
    validatePagination,
} from '../middlewares/validation';

import * as controller from '../controllers/restaurantEvent';

// ***************************************************************************************************************

const eventTimeValidation = (value: any) => {
    const event_date = new Date(value.event_date);
    const start_time = new Date(toDateISO(event_date, value.start_time));
    const end_time = new Date(toDateISO(event_date, value.end_time));

    if (event_date < new Date()) {
        throw new Error('Event date cannot be in the past');
    }

    if (start_time >= end_time) {
        throw new Error('Start time must be before end time');
    }

    return true;
};

const eventPayloadValidation = [
    body('restaurant_id').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Restaurant ID is required'),
    body('name').notEmpty().withMessage('Event name is required'),
    body('event_date').isISO8601().withMessage('Valid event date is required'),
    body('start_time').isTime({ hourFormat: "hour24", mode: "default" }).withMessage('Event starting time must be in HH:MM format'),
    body('end_time').isTime({ hourFormat: "hour24", mode: "default" }).withMessage('Event ending time must be in HH:MM format'),
    body('description').isString().isLength({ max: API_MAX_TEXT_REQUEST_LENGTH }).withMessage(`Description is a string that cannot exceed ${API_MAX_TEXT_REQUEST_LENGTH} characters`),
    body('price').optional({ values: 'falsy' }).isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price required, use 0 to set a free price entry'),
    body('spots').optional({ values: 'falsy' }).isInt({ min: API_MIN_ID_NUMBER }).withMessage('The number of spots is a number, if you want an opened event don\'t send this property.'),
    body().custom(eventTimeValidation),
    Validate.Handle.error
];

const v1 = Router();

v1.get(
    '/',
    validatePagination,
    controller.getAllRestaurantEvents
);

v1.use(validateJWT as any); // ========================================================================

v1.get(
    '/bought-tickets',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validatePagination,
    controller.getBoughtTickets
);

v1.post(
    '/',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    eventPayloadValidation,
    controller.createRestaurantEvent as any
);

v1.get('/:id', validateId, controller.getRestaurantEventById);

v1.patch(
    '/:id',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    [
        body('restaurant_id').optional({ values: 'falsy' }).isInt({ min: API_MIN_ID_NUMBER }).withMessage('Restaurant ID is required'),
        body('name').optional({ values: 'falsy' }).isString().withMessage('Event name is required'),
        body('event_date').optional({ values: 'falsy' }).isISO8601().withMessage('Valid event date is required'),
        body('start_time').optional({ values: 'falsy' }).isTime({ hourFormat: "hour24", mode: "default" }).withMessage('Event starting time must be in HH:MM format'),
        body('end_time').optional({ values: 'falsy' }).isTime({ hourFormat: "hour24", mode: "default" }).withMessage('Event ending time must be in HH:MM format'),
        body('description').optional({ values: 'falsy' }).isString().isLength({ max: API_MAX_TEXT_REQUEST_LENGTH }).withMessage(`Description is a string that cannot exceed ${API_MAX_TEXT_REQUEST_LENGTH} characters`),
        body('price').optional({ values: 'falsy' }).isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price required, use 0 to set a free price entry'),
        body('spots').optional({ values: 'falsy' }).isInt({ min: API_MIN_ID_NUMBER }).withMessage('The number of spots is a number, if you want an opened event don\'t send this property.'),
        body().custom((value) => {
            if ([
                value.event_date,
                value.start_time,
                value.end_time
            ].every(v => v === undefined)) {
                return true;
            }

            if ([
                value.event_date,
                value.start_time,
                value.end_time
            ].some(v => v === undefined)) {
                throw new Error('Must pass date and both start and end time to update event schedule.');
            }

            return eventTimeValidation(value);
        }),
        Validate.Handle.error
    ],
    controller.updateRestaurantEvent
);

v1.put(
    '/:id',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    eventPayloadValidation,
    controller.updateRestaurantEvent
);

v1.delete(
    '/:id',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    controller.deleteRestaurantEvent
);

v1.patch(
    '/:id/cancel',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    controller.cancelRestaurantEvent
);

const eventRoutes = {
    v1
};

export default eventRoutes;
