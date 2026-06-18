import {
    type driverType,
    type staffMemberType
} from '@Madeirense/shared';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type {
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = `workstation${('' | `.${keyof (staffMemberType)}`)}.${eventActionType}`;

const WorkstationsEventEmitter = new AppEmitter<staffMemberType, eventType>();

WorkstationsEventEmitter.on('workstation.Users.created', async (staffMember) => {
    try {
        pushNotificationController.BATCH$pushToStaff<Partial<staffMemberType>>(
            {
                notificationId: 'MXP$BACK_OFFICE$Staff$INSERT',
                data: staffMember
            }
        );

        switch (staffMember.Users?.user_role) {
            case 'Driver':
                const {
                    Users,
                    ...workstations
                } = staffMember;

                pushNotificationController.BATCH$pushAll<driverType>(
                    {
                        notificationId: 'MXP$APP_PROPERTY$Drivers$INSERT',
                        data: {
                            ...Users,
                            Workstations: [workstations],
                            property_id: Users.user_id
                        }
                    }
                );

                break;

            default:
                break;
        }
    } catch (error) {
        console.error(`Failed to push inserted staff member:`, error);
    }
});

export default WorkstationsEventEmitter;