import { 
    type Coupons
} from '@Madeirense/database';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type { 
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = `coupon${('' | `.${keyof Coupons}`)}.${eventActionType}`;

const CouponsEventEmitter = new AppEmitter<Coupons, eventType>();

CouponsEventEmitter.on('coupon.created', async (coupon) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<Coupons>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Coupons$INSERT',
                data: { ...coupon, property_id: coupon.coupon_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push inserted coupon:`, error);
    }
});

CouponsEventEmitter.on('coupon.updated', async (coupon) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<Coupons>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Coupons$UPDATE',
                data: { ...coupon, property_id: coupon.coupon_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push updated coupon:`, error);
    }
});

CouponsEventEmitter.on('coupon.deleted', async (coupon) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<Coupons>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Coupons$DELETE',
                data: { ...coupon, property_id: coupon.coupon_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push deleted coupon:`, error);
    }
});

async function SYNCHRONIZE_COUPONS () {
    try {
        pushNotificationController.BATCH$pushAll<any>(
            {
                notificationId: 'MXP$APP_PROPERTY$Coupons$FETCH',
                data: undefined
            }
        );
    } catch (error) {
        console.error(`Failed to push coupon fetch synchronization:`, error);
    }
};

CouponsEventEmitter.SILENT$on('coupon.expires_at.created', SYNCHRONIZE_COUPONS);
CouponsEventEmitter.SILENT$on('coupon.expires_at.updated', SYNCHRONIZE_COUPONS);

export default CouponsEventEmitter;