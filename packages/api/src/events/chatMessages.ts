import {
    type Madeirense$Types,
    type chatEntryType
} from '@Madeirense/shared';

import prisma from '../lib/prisma';

import AppEmitter from './emitter';

import type {
    eventActionType
} from './types';

import * as pushNotificationController from '../controllers/pushNotifications';

// ***************************************************************************************************************

type eventType = `chat_messages${('' | `.${keyof chatEntryType}`)}.${eventActionType}`;

const ChatMessagesEventEmitter = new AppEmitter<chatEntryType, eventType>();

ChatMessagesEventEmitter.on('chat_messages.created', async ({
    Orders,
    ...chat_message
}) => {
    try {
        const payload = {
            notificationId: 'MXP$CHAT_REPLY',
            data: chat_message
        } as Madeirense$Types.pushNotification<Partial<chatEntryType>>;

        switch (chat_message.sender_type) {
            case 'restaurant':
                pushNotificationController.push<Partial<chatEntryType>>(Orders?.user_id as number, payload);

                break;

            case 'user':
                const result = await prisma.users.findMany({ where: { user_role: { in: ['Admin', 'Staff'] } }, select: { user_id: true } });

                pushNotificationController.BATCH$push<Partial<chatEntryType>>(
                    result.map(u => u.user_id) as number[],
                    payload
                );

                break;

            default: break;
        }
    } catch (error) {
        console.error('Failed to push order driver assignation notification:', error);
    }
});

export default ChatMessagesEventEmitter;