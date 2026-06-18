import { Router } from 'express';

import { body } from 'express-validator';

import { 
    $Enums
} from '@Madeirense/database';

import { 
    API_MIN_ID_NUMBER
} from '../utilities/constants';

import {
    validateJWT,
    onlyAllowUserRoles
} from '../middlewares/authorization';

import {
    Validate,
    validateId,
    validatePagination
} from '../middlewares/validation';

import * as controller from '../controllers/payment';

// ***************************************************************************************************************

const v1 = Router();

v1.use(validateJWT as any); // ========================================================================

v1.post(
    '/',
    [
        body('order_id').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Order ID is required'),
        body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount is required'),
        body('payment_method').isIn(Object.values($Enums.Payments_payment_method)).withMessage(`The payment method must be one of the types: ${Object.values($Enums.Payments_payment_method).join(', ')}`),
        Validate.Handle.error
    ],
    controller.createPayment as any
);

v1.get(
    '/mine',
    validatePagination,
    controller.getUserPayments as any
);

v1.get(
    '/:id',
    validateId,
    controller.getPaymentById as any
);

v1.patch(
    '/:id/status',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    [
        body('status').isIn(['pending', 'COMPLETED', 'FAILED', 'REFUNDED']).withMessage('Valid payment status is required'),
        Validate.Handle.error
    ],
    controller.updatePaymentStatus as any
);

v1.get(
    '/',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validatePagination,
    controller.getAllPayments
);

v1.delete(
    '/:id',
    onlyAllowUserRoles([
        'Admin'
    ]) as any,
    validateId,
    controller.deletePayment
);

const paymentRoutes = {
    v1
};

export default paymentRoutes;