import { 
    type Request
} from 'express';

import passport from 'passport';

import jwt from 'jsonwebtoken';

import { 
    Strategy as FacebookStrategy
} from 'passport-facebook';

import {
    Strategy as GoogleStrategy,
    type StrategyOptionsWithRequest as GSOWR,
    type VerifyCallback as GVCB
} from 'passport-google-oauth20';

import {
    ExtractJwt,
    Strategy as JwtStrategy
} from 'passport-jwt';

import {
    type Users
} from '@Madeirense/database';

import {
    isTruthful
} from '@Madeirense/shared';

import env from '../env.js';

import {
    prisma
} from '../lib/prisma.js';

import {
    generateToken
} from '../utilities/generators.js';

import {
    parseTokensFromRequest
} from '../utilities/parsers.js';

import {
    Prisma$Utilities
} from '../utilities/ORM.js';

import type {
    googleProfileType,
    facebookProfileType,
    JWTPayloadType
} from '../types.js';

// ***************************************************************************************************************

passport.use(
    new FacebookStrategy(
        {
            clientID: env.FACEBOOK_APP_ID,
            clientSecret: env.FACEBOOK_APP_SECRET,
            callbackURL: env.FACEBOOK_CALLBACK_URL,
            profileFields: [
                'displayName',
                'email',
                'id',
                'photos'
            ]
        } as any,
        (async (
            accessToken: string,
            refreshToken: string,
            profile: facebookProfileType,
            done: (error: Error | null, user?: any) => void
        ) => {
            try {
                let user = await prisma.users.findUnique({
                    where: { email: profile.emails[0]?.value }
                });

                switch (true) {
                    case (isTruthful(user)):
                        return done(null, user as Users);

                    default:
                        user = await prisma.users.create({
                            data: {
                                name: profile.displayName,
                                phone: '',
                                email: profile.emails[0]?.value || '',
                                profile_photo: profile.photos[0]?.value,
                                user_role: 'Customer'
                            }
                        });

                        return done(null, user);
                };
            } catch (error) {
                return done(error as Error, undefined);
            }
        }) as any
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_CALLBACK_URL
        } as GSOWR,
        (async (
            accessToken: string,
            refreshToken: string,
            profile: googleProfileType,
            done: GVCB
        ) => {
            try {
                let user = await prisma.users.findUnique({
                    where: { email: (profile?.emails ?? [])[0]?.value }
                });

                switch (true) {
                    case (isTruthful(user)):
                        return done(null, user as Users);

                    default:
                        user = await prisma.users.create({
                            data: {
                                name: profile.displayName,
                                phone: '',
                                email: (profile?.emails ?? [])[0]?.value || '',
                                profile_photo: (profile.photos ?? [])[0]?.value,
                                user_role: 'Customer'
                            }
                        });

                        return done(null, user);
                };
            } catch (error) {
                return done(error, undefined);
            }
        }) as any
    )
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    let {
                        refreshToken,
                        sessionToken
                    } = parseTokensFromRequest(req);

                    switch (true) {
                        case (
                            [
                                refreshToken,
                                sessionToken
                            ].every(t => t === '')
                        ):
                            return null;

                        case (
                            [
                                refreshToken,
                                sessionToken
                            ].every(t => t !== '')
                        ): {
                                const {
                                    userId: user_id,
                                    email,
                                    role: user_role
                                } = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET!) as JWTPayloadType;

                                sessionToken = generateToken({
                                    user_id,
                                    email,
                                    user_role
                                }, 'SESSION');

                                return sessionToken;
                            };

                        default:
                            return sessionToken;
                    };
                },
            ]),
            secretOrKey: env.JWT_SESSION_SECRET
        },
        async (payload: JWTPayloadType, done) => {
            try {
                const user = await prisma.users.findUnique({
                    where: { user_id: parseInt(payload.userId, 10) },
                    include: {
                        ...Prisma$Utilities.Inclusions.Users.Profile
                    }
                });

                switch (true) {
                    case (isTruthful(user)):
                        return done(null, user as Users);

                    default:
                        return done(null, false);
                };
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.users.findUnique({
            where: { user_id: id }
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;