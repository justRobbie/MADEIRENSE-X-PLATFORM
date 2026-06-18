import { Router } from 'express';

import {
    param,
    query
} from 'express-validator';

import { 
    DATE_INTERVALS, 
    Madeirense$Enumerators
} from '@Madeirense/shared';

import {
    onlyAllowUserRoles,
    validateJWT
} from '../middlewares/authorization';

import {
    Validate
} from '../middlewares/validation';

import * as controller from '../controllers/statistics';
import { API_MIN_ID_NUMBER } from 'utilities/constants';

// ***************************************************************************************************************

const defaultValidations = [
    ...Validate.Parameters.table,
    ...Validate.Queries.statistics,
];

const v1 = Router();

v1.use(validateJWT as any); // ========================================================================

v1.use(onlyAllowUserRoles([
    'Admin',
    'Staff'
]) as any);

v1.get(
    '/count/:table/per/:column',
    [
        ...defaultValidations,
        param('column').notEmpty().withMessage('A column must be passed'),
        Validate.Handle.error
    ],
    controller.getCountPerProperty as any
);

v1.get(
    '/:table/:relation/count',
    [
        ...defaultValidations,
        query('restaurant_id').optional({ values: 'falsy' }).isInt({ min: API_MIN_ID_NUMBER }).withMessage('Restaurant ID query should be positive integer'),
        Validate.Handle.error
    ],
    controller.getRelationCount as any
);

v1.get(
    '/:table/:relation/top',
    [
        ...defaultValidations,
        Validate.Handle.error
    ],
    controller.getTopRelation as any
);

v1.get(
    '/:table/:relation/:action/count',
    [
        ...defaultValidations,
        param('action').isIn(Object.values(Madeirense$Enumerators.StatisticsParameters.Actions)).withMessage(`Only ${Object.values(Madeirense$Enumerators.StatisticsParameters.Actions).join(', ')} actions are allowed`),
        Validate.Handle.error
    ],
    controller.getRelationActionCount as any
);

v1.get(
    '/:table/report/:fact',
    [
        ...defaultValidations,
        param('fact').isIn(Object.values(Madeirense$Enumerators.StatisticsParameters.Fact)).withMessage(`Only ${Object.values(Madeirense$Enumerators.StatisticsParameters.Fact).join(', ')} facts are allowed`),
        query(Madeirense$Enumerators.SearchQueries.interval).optional({ values: 'falsy' }).isIn(DATE_INTERVALS).withMessage(`Date interval must be within: ${DATE_INTERVALS.join(', ')}`),
        query(Madeirense$Enumerators.SearchQueries.month).optional({ values: 'falsy' }).isInt({ min: 1, max: 12 }).withMessage(`Choose a valid month, 1 - 12`),
        query(Madeirense$Enumerators.SearchQueries.year).optional({ values: 'falsy' }).isInt({ min: 2025, max: (new Date()).getFullYear() }).withMessage(`Choose a valid year for a statistic, from 2025 until now.`),
        Validate.Handle.error
    ],
    controller.getReport as any
);

const statisticsRoutes = {
    v1
};

export default statisticsRoutes;