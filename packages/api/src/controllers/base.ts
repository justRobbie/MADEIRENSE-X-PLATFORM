import {
    type Request,
    type Response
} from 'express';

import ping from 'ping';

import {
    type API$Types,
    type dependencyType,
} from '@Madeirense/shared';

import env from '../env.js';

// ***************************************************************************************************************

const environment = env.NODE_ENV;
const isVerbosityEnabled = env.ENABLE_VERBOSITY;

//TODO: Declare each dependency use in this app in the array below
const dependencies: ReadonlyArray<dependencyType> = [
];

async function health(
    request: Request,
    response: Response<API$Types.response<{
        validatedDependencies: dependencyType[],
        timestamp?: string,
        environment?: typeof env.NODE_ENV,
        supported_versions?: string[],
        endpoints?: Record<string, string[]>
    } | undefined, ('HAS_UNAVAILABLE_ESSENTIALS')>>
) {
    let validatedDependencies: dependencyType[] = [];

    try {
        if (isVerbosityEnabled) console.log(`> Pinging hosts [${environment}]: `);
        if (isVerbosityEnabled) dependencies.forEach(d => console.log(`> -- ${d.name} [${d.endpoint}]`));
        if (isVerbosityEnabled) console.log(`>`);

        //TODO: (If required) Implement more robust dependency health checking methods
        validatedDependencies = await Promise.all(dependencies.map(async d => {
            try {
                if (d.endpoint === '') throw new Error('MISSING_ENDPOINT');

                const result = await ping.promise.probe(d.endpoint);

                if (isVerbosityEnabled) console.log(`> Result: [${d.endpoint} / ${result.numeric_host}] :: { STATUS: ${result.alive ? '⬆️' : '⬇️'} }`);

                if (Math.ceil(result.packetLoss) === 100)
                    throw new Error('There was a 100% packet loss, make sure you have the required permissions, or are in the correct network to reach this server');

                return {
                    ...d,
                    status: (result.alive) ? 'Up' : 'Down'
                }
            } catch (error) {
                return {
                    ...d,
                    error: (error as Error).message,
                    status: 'Unknown'
                }
            }
        }));

        const areEssentialDependenciesUp = (validatedDependencies
            .filter(d => d.essential)
            .every(d => d.status === 'Up')
        );

        if (!areEssentialDependenciesUp) throw new Error('HAS_UNAVAILABLE_ESSENTIALS');

        return response.status(200).json({
            success: true,
            data: {
                validatedDependencies,
                timestamp: new Date().toISOString(),
                environment: env.NODE_ENV,
                supported_versions: [
                    'v1 (current)'
                ],
                endpoints: {
                    'v1': [
                        'auth',
                        'cart',
                        'comments',
                        'coupons',
                        'courier-positions',
                        'delivery-locations',
                        'orders',
                        'payments',
                        'products',
                        'restaurants',
                        'restaurant-events',
                        'reviews',
                        'users'
                    ]
                }
            },
            message: `${env.APP_NAME} is up and running`,
            status: 'Up'
        });
    } catch (error) {
        //TODO: (If applicable) Add error handler for each health checking scenario
        switch ((error as Error).message) {
            case 'HAS_UNAVAILABLE_ESSENTIALS': return response.status(503).json({
                success: false,
                code: 'HAS_UNAVAILABLE_ESSENTIALS',
                message: 'Some (or all) dependencies labeled as essential are down or unresponsive, the application may be working, be will register delays or other issues.',
                data: {
                    validatedDependencies
                },
                status: 'Down',
            });

            default: return response.status(200).json({
                success: false,
                message: `${env.APP_NAME} is up and running with some issues`,
                data: {
                    validatedDependencies
                },
                status: 'Unknown',
            });
        }
    } finally {
        //TODO: provide clean up procedure if required
    }
};

async function welcome(
    request: Request,
    response: Response<API$Types.response<undefined, 'Error'>>
) {
    return response.status(200).json({
        data: undefined,
        success: true,
        message: `Welcome to ${env.APP_NAME}'s API. This is version 1.0.0 and you may find the implemented routes in the data object.`,
    });
};

const BaseController = {
    v1: {
        health,
        welcome
    }
    // TODO: (If applicable) Add experimental routes.
    // $EXP__: { }
};

export default BaseController;