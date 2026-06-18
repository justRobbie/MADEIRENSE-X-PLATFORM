import { 
    type Response
} from 'express';

import { 
    type Courier_Positions
} from '@Madeirense/database';

import {
    type API$Types
} from '@Madeirense/shared';

import {
    Messages
} from './utilities/enumerators';

import { 
    handleControllerError
} from './utilities/handlers';

import { prisma } from '../lib/prisma';

import type { 
    IAuthenticatedRequest
} from '../interfaces';

// ***************************************************************************************************************

export const getCourierPositionByOrder = async (
    req: IAuthenticatedRequest<{ id: string }>,
    res: Response<API$Types.response<Courier_Positions | undefined>>
) => {
    try {
        const order = await prisma.orders.findUnique({
            where: {
                order_id: parseInt(req.params.id as string),
                AND: [
                    { status: 'assigned' }
                ]
            }
        });

        if (!order) return res.status(404).json({
            data: undefined,
            code: 'API_GENERIC_NOT_FOUND_ERROR',
            message: 'Unable to find an order that was assigned for delivery with this id',
            success: false
        });

        const courier_Positions = await prisma.courier_Positions.findFirst({
            where: {
                courier_id: order.courier_id as number
            }
        });

        if (!courier_Positions) return res.status(404).json({
            data: undefined,
            code: 'API_GENERIC_NOT_FOUND_ERROR',
            message: 'This position isn\'t being broadcast, make sure the order was assigned properly',
            success: false
        });

        return res.json({
            data: courier_Positions,
            message: 'Position fetched successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export const getCurrentPosition = async (
    req: IAuthenticatedRequest, 
    res: Response<API$Types.response<Courier_Positions | undefined>>
) => {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const courier_Positions = await prisma.courier_Positions.findUnique({
            where: {
                position_id: req.user.user_id
            }
        });

        if (!courier_Positions) return res.status(404).json({
            data: undefined,
            code: 'API_GENERIC_NOT_FOUND_ERROR',
            message: 'This courier has not broadcast position, make sure they are assigned to an order before checking again',
            success: false
        });

        return res.json({
            data: courier_Positions,
            message: 'Position fetched successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export const ping = async (
    req: IAuthenticatedRequest<
        { id: string },
        Partial<Omit<Courier_Positions, ('position_id' | 'recorded_at' | 'courier_id')>>
    >, 
    res: Response
) => {
    const position_id = parseInt(req.params.id);

    let courier_Positions: Courier_Positions | null = null;

    try {
        courier_Positions = await prisma.courier_Positions.findUnique({
            where: {
                position_id
            }
        });

        if (!courier_Positions) return res.status(404).json({
            data: undefined,
            code: 'API_GENERIC_NOT_FOUND_ERROR',
            message: 'There\'s no initially recorded position at this id',
            success: false
        });

        courier_Positions = await prisma.courier_Positions.update({
            where: {
                position_id
            },
            data: {
                ...(req.body),
                recorded_at: new Date()
            }
        });

        return res.json({
            data: courier_Positions,
            message: 'Position pinged successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    } finally {
        if (!courier_Positions) return;

        req.events?.courier_positions.emit(
            'courier_positions.updated',
            courier_Positions
        );
    }
};