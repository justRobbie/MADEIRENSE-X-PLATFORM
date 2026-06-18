import { 
    type Restaurants
} from '@Madeirense/database';

import { 
    type restaurantType
} from '@Madeirense/shared';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type { 
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = (
    |   `restaurant${('' | `.${keyof restaurantType}`)}.${eventActionType}`
    |   `restaurants.${eventActionType}`
);

const RestaurantEventEmitter = new AppEmitter<restaurantType | Restaurants, eventType>();


RestaurantEventEmitter.on('restaurant.created', async (restaurant) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<restaurantType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Restaurants$INSERT',
                data: { ...restaurant, property_id: restaurant.restaurant_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push inserted restaurant:`, error);
    }
});

RestaurantEventEmitter.on('restaurant.updated', async (restaurant) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<restaurantType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Restaurants$UPDATE',
                data: { ...restaurant, property_id: restaurant.restaurant_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push updated restaurant:`, error);
    }
});

RestaurantEventEmitter.SILENT$on('restaurants.updated', async () => {
    try {
        pushNotificationController.BATCH$pushAll<any>(
            {
                notificationId: 'MXP$APP_PROPERTY$Restaurants$FETCH',
                data: undefined
            }
        );
    } catch (error) {
        console.error(`Failed to push updated restaurant:`, error);
    }
});

RestaurantEventEmitter.on('restaurant.deleted', async (restaurant) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<restaurantType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Restaurants$DELETE',
                data: { ...restaurant, property_id: restaurant.restaurant_id }
            }
        );
    } catch (error) {
        console.error(`Failed to push deleted restaurant:`, error);
    }
});

export default RestaurantEventEmitter;