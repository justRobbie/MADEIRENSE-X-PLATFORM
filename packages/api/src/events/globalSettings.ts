import { 
    randomUUID
} from 'crypto';

import { 
    prisma,
    type Global_Settings, 
} from '@Madeirense/database';

import { 
    type applicationSettingsType
} from '@Madeirense/shared';

import AppEmitter from './emitter';

import * as pushNotificationController from '../controllers/pushNotifications';

import type { 
    eventActionType
} from './types';

// ***************************************************************************************************************

type eventType = `global_settings${('' | '.eligible_payment_types' | `.${keyof Global_Settings}`)}.${eventActionType}`;
type _Global_Settings = Omit<applicationSettingsType, 'setting_id'>;

const GlobalSettingsEventEmitter = new AppEmitter<_Global_Settings, eventType>();

GlobalSettingsEventEmitter.on('global_settings.updated', async (global_settings) => {
    try {
        pushNotificationController.BATCH$pushAll<Partial<applicationSettingsType>>(
            {
                notificationId: 'MXP$APP_PROPERTY$Global_Settings$UPDATE',
                data: { ...global_settings }
            }
        );
    } catch (error) {
        console.error(`Failed to push updated global settings:`, error);
    }
});

GlobalSettingsEventEmitter.on('global_settings.eligible_payment_types.updated', async (global_settings) => {
    try {
        pushNotificationController.BATCH$pushAll<_Global_Settings>(
            {
                notificationId: 'MXP$APP_PROPERTY$Global_Settings$UPDATE',
                data: global_settings
            }
        );
    } catch (error) {
        console.error(`Failed to push updated eligible payments to global settings:`, error);
    }
});

GlobalSettingsEventEmitter.SILENT$on('global_settings.change_version.updated', async () => {
    try {
        await prisma.global_Settings.updateMany({
            data: {
                change_version: randomUUID()
            }
        });
    } catch (error) {
        console.error(`Failed to update global settings change version:`, error);
    }
});

export default GlobalSettingsEventEmitter;