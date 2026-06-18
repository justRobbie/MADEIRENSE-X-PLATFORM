import { pbkdf2Sync } from 'crypto';

import env from 'env';

// ***************************************************************************************************************

export const encryptPassword = (password: string) => {
    if (!env.PASSWORD_ENCRYPTION_SALT) throw new Error('Encryption is missing some salt 🧂');

    return pbkdf2Sync(
        password,
        env.PASSWORD_ENCRYPTION_SALT as string,
        env.PASSWORD_ENCRYPTION_ITERATOR,
        64,
        'sha512'
    ).toString('hex');
};