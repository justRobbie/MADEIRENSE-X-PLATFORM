import { 
    prisma,
    type Courier_Positions, 
    type Orders
} from '@Madeirense/database';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type { 
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = `courier_positions${('' | `.${keyof Courier_Positions}`)}.${eventActionType}`;
type _Courier_Positions = Omit<Courier_Positions, 'position_id'>;

const CourierPositionsEventEmitter = new AppEmitter<_Courier_Positions, eventType>();

CourierPositionsEventEmitter.on('courier_positions.updated', async (courier_positions) => {
    try {
        const {
            courier_id: cId
        } = courier_positions;

        const { order_id, user_id } = await prisma.orders.findFirst({
            where: {
                status: 'assigned',
                AND: [
                    { coupon_id: cId as number }
                ]
            }
        }) as Orders;

        pushNotificationController.push<Partial<_Courier_Positions & { order_id: number }>>(
            user_id as number,
            {
                notificationId: 'MXP$COURIER_POSITION$PING',
                data: { ...courier_positions, order_id }
            }
        );

        pushNotificationController.BATCH$pushToStaff<Partial<_Courier_Positions> & { order_id: number }>(
            {
                notificationId: 'MXP$COURIER_POSITION$PING',
                data: { ...courier_positions, order_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push courier position update to client and/or staff:`, error);
    }
});

export default CourierPositionsEventEmitter;