import { 
    type User_Comments
} from '@Madeirense/database';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type { 
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = `user_comments${('' | `.${keyof User_Comments}`)}.${eventActionType}`;

const UserCommentsEventEmitter = new AppEmitter<User_Comments, eventType>();

UserCommentsEventEmitter.on('user_comments.created', async (comment) => {
    try {
        pushNotificationController.BATCH$pushAll<User_Comments>({
            notificationId: 'MXP$PRODUCT_COMMENT',
            data: comment
        });
    } catch (error) {
        console.error('Failed to push product notification:', error);
    }
});

export default UserCommentsEventEmitter;