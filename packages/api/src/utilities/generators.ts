import jwt from 'jsonwebtoken';

import env from 'env';

import type {
    JWTPayloadType
} from '../types';

// ***************************************************************************************************************

export const generateToken = (user: any, type: ('SESSION' | 'REFRESH' | '') = ''): string => {
    const payload: JWTPayloadType = {
        userId: user.user_id,
        email: user.email,
        role: user.user_role
    };

    const secret = type === 'REFRESH'
        ? (env.JWT_REFRESH_SECRET ?? '')
        : type === 'SESSION'
            ? (env.JWT_SESSION_SECRET ?? '')
            : '';

    return jwt.sign(
        payload,
        secret,
        {
            expiresIn: env.JWT_EXPIRE || '7d'
        } as jwt.SignOptions
    );
};