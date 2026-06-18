import { 
    type productType
} from '@Madeirense/shared';

import AppEmitter from './emitter';

import type { 
    eventActionType
} from './types';

import * as pushNotificationController from '../controllers/pushNotifications';

// ***************************************************************************************************************

type eventType = `product${('' | `.${keyof productType}`)}.${eventActionType}`;

const ProductsEventEmitter = new AppEmitter<productType, eventType>();


ProductsEventEmitter.on('product.created', async (product) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<productType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Products$INSERT',
                data: { ...product, property_id: product.product_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push inserted product:`, error);
    }
});

ProductsEventEmitter.on('product.updated', async (product) => {
    try {
        const result = await pushNotificationController.BATCH$pushAll<Partial<productType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Products$UPDATE',
                data: { ...product, property_id: product.product_id }
            }
        );

        console.log(`Pushed product update to all subscribers:`, result);
    } catch (error) {
        console.error(`Failed to push updated product:`, error);
    }
});

ProductsEventEmitter.on('product.deleted', async (product) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<productType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Products$DELETE',
                data: { ...product, property_id: product.product_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push deleted product:`, error);
    }
});

async function SYNCHRONIZE_PRODUCTS () {
    try {
        pushNotificationController.BATCH$pushAll<any>(
            {
                notificationId: 'MXP$APP_PROPERTY$Products$FETCH',
                data: undefined
            }
        );
    } catch (error) {
        console.error(`Failed to push product fetch synchronization:`, error);
    }
};

ProductsEventEmitter.SILENT$on('product.discount.created', SYNCHRONIZE_PRODUCTS);
ProductsEventEmitter.SILENT$on('product.discount.deleted', SYNCHRONIZE_PRODUCTS);

export default ProductsEventEmitter;