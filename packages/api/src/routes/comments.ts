import { Router } from 'express';

import { body } from 'express-validator';

import {
    API_MAX_TEXT_REQUEST_LENGTH,
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

import * as controller from '../controllers/comment';

// ***************************************************************************************************************

const commentPayloadValidation = [
    body('product_id').isInt({ min: API_MIN_ID_NUMBER }).withMessage('Product ID is required'),
    body('comment').notEmpty().isLength({ max: API_MAX_TEXT_REQUEST_LENGTH }).withMessage(`Comment is required and cannot exceed ${API_MAX_TEXT_REQUEST_LENGTH} characters`),
    Validate.Handle.error
];

const v1 = Router();

v1.get(
    '/',
    validatePagination,
    controller.getAllComments
);

v1.get(
    '/:id',
    validateId,
    controller.getCommentById
);

v1.use(validateJWT as any); // ========================================================================

v1.post(
    '/',
    commentPayloadValidation,
    controller.createComment as any
);

v1.get(
    '/mine',
    validatePagination,
    controller.getUserComments as any
);

v1.put(
    '/:id',
    validateId,
    commentPayloadValidation,
    controller.updateComment as any
);

v1.delete(
    '/:id',
    validateId,
    controller.deleteComment as any
);

v1.delete('/:id/admin',
    onlyAllowUserRoles(['Admin']) as any,
    validateId,
    controller.adminDeleteComment as any
);

const commentsRoutes = {
    v1
};

export default commentsRoutes;
