import {
    Router
} from 'express';

import {
    body,
    param,
    query
} from 'express-validator';

import {
    Carts
} from '@Madeirense/shared';

import {
    API_MAX_CART_ITEMS_FOR_REMOVAL,
    API_MIN_CART_ITEMS_FOR_REMOVAL,
    API_MIN_ID_NUMBER
} from '../utilities/constants';

import {
    validateJWT
} from '../middlewares/authorization';

import {
    Validate,
    validateId,
    validatePagination,
} from '../middlewares/validation';

import * as controller from '../controllers/cart';

// ***************************************************************************************************************

const cartTypeValidation = [
    param('type').notEmpty().isIn(["all", ...Object.values(Carts)]).withMessage(`Only ${["all", ...Object.values(Carts)].join(', ')} cart types are accepted`)
];

const v1 = Router();

v1.use(validateJWT as any);

v1.post(
    '/add',
    [
        body('product_id').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Valid product ID is required'),
        body('quantity').optional({ values: 'falsy' }).isInt({ min: API_MIN_CART_ITEMS_FOR_REMOVAL, max: API_MAX_CART_ITEMS_FOR_REMOVAL }).withMessage(`Product quantities are to be defined within ${API_MIN_CART_ITEMS_FOR_REMOVAL} - ${API_MAX_CART_ITEMS_FOR_REMOVAL}.`),
        Validate.Handle.error
    ],
    controller.addToCart as any
);

v1.delete(
    '/clear/:type',
    [
        ...cartTypeValidation,
        Validate.Handle.error
    ],
    controller.clearCart as any
);

v1.get(
    '/mine',
    validatePagination,
    controller.getUserCart as any
);

v1.get(
    '/mine/:type/summary',
    [
        ...cartTypeValidation,
        Validate.Handle.error
    ],
    controller.getCartSummary as any
);

v1.patch(
    '/product/remove-items',
    [
        body('product_ids').isArray({
            min: API_MIN_CART_ITEMS_FOR_REMOVAL,
            max: API_MAX_CART_ITEMS_FOR_REMOVAL
        }).notEmpty().withMessage(`Must provide ${API_MIN_CART_ITEMS_FOR_REMOVAL} - ${API_MAX_CART_ITEMS_FOR_REMOVAL} product ids to be removed from the cart.`),
        body('product_ids.*').isInt({
            min: API_MIN_ID_NUMBER
        }).withMessage('Valid product ID is required'),
        Validate.Handle.error
    ],
    controller.removeFromCartByProducts as any
);

v1.delete(
    '/product/:id',
    [
        ...Validate.Parameters.id,
        query('quantity').optional({ values: 'falsy' }).isInt({
            min: API_MIN_CART_ITEMS_FOR_REMOVAL,
            max: API_MAX_CART_ITEMS_FOR_REMOVAL
        }).withMessage(`Must provide ${API_MIN_CART_ITEMS_FOR_REMOVAL} - ${API_MAX_CART_ITEMS_FOR_REMOVAL} product ids to be removed from the cart.`),
        Validate.Handle.error
    ],
    controller.removeFromCartByProduct as any
);

v1.get(
    '/',
    validatePagination,
    controller.getAllCartItems as any
);

v1.get(
    '/:id',
    validateId,
    controller.getCartItemById as any
);

v1.delete(
    '/:id',
    validateId,
    controller.removeFromCart as any
);

const cartRoutes = {
    v1
};

export default cartRoutes;

