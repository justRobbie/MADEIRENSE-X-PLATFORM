import {
    type Request,
    type Response
} from 'express';

import { 
    type Restaurant_Events
} from '@Madeirense/database';

import {
    DEFAULT_API_LIST_LIMIT,
    API$Enumerators,
    Madeirense$Enumerators,
    toDateISO,
    type API$Types,
    type restaurantEventType,
    type boughtTicketType,
} from '@Madeirense/shared';

import {
    handleControllerError
} from './utilities/handlers';

import { prisma } from '../lib/prisma';

import type { IEventfulRequest } from '../middlewares/events';

// ***************************************************************************************************************

type timeType = `${number}:${number}`;

export async function cancelRestaurantEvent(
    req: IEventfulRequest<{ id: string }>,
    res: Response<API$Types.response<restaurantEventType | undefined>>
) {
    const { id: _id } = req.params;

    const event_id = parseInt(_id as string, 10);

    let event: restaurantEventType | null = null;

    try {
        const [Restaurant_Events, Orders, Payments] = await prisma.$transaction(async $trx => {
            const restaurant_event = await $trx.restaurant_Events.update({
                where: { event_id },
                data: {
                    status: "cancelled"
                }
            });

            if (!restaurant_event) throw new Error("Restaurant event not found");

            const ordersBatch = await $trx.orders.updateMany({
                where: { event_id },
                data: {
                    status: "cancelled"
                }
            });

            const paymentsBatch = await $trx.payments.updateMany({
                where: {
                    Orders: { event_id }
                },
                data: {
                    status: "refunded"
                }
            });

            //TODO: Implement client wallet logic

            return [
                restaurant_event,
                ordersBatch.count,
                paymentsBatch.count
            ];
        });

        event = { ...Restaurant_Events };

        return res.status(201).json({
            data: {
                ...Restaurant_Events,
                _count: {
                    Orders,
                    Payments
                }
            },
            message: 'Restaurant event cancelled successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    } finally {
        if (!event) return;

        req.events?.global_settings.SILENT$emit("global_settings.change_version.updated");
        req.events?.restaurant_events.emit("restaurant_event.updated", event);
    }
};

export async function createRestaurantEvent(
    req: IEventfulRequest<
        any,
        {
            restaurant_id: number,
            name: string,
            description: string,
            event_date: Date,
            start_time: timeType,
            end_time: timeType,
            price?: number,
            thumbnail_url?: string,
            spots?: number,
            video_url: string
        }
    >,
    res: Response<API$Types.response<any | undefined>>
) {
    const {
        restaurant_id,
        name,
        description,
        event_date: ed,
        start_time: st,
        end_time: et,
        price = undefined,
        thumbnail_url,
        spots = undefined,
        video_url
    } = req.body;

    let event: restaurantEventType | null = null;

    try {
        const restaurant = await prisma.restaurants.findUnique({
            where: { restaurant_id }
        });

        if (!restaurant) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Restaurant not found',
                success: false
            });
        }

        const event_date = new Date(ed);

        event = await prisma.restaurant_Events.create({
            data: {
                price: price ?? 0,
                spots: spots ?? null,
                restaurant_id,
                name,
                description,
                event_date,
                start_time: toDateISO(event_date, st),
                end_time: toDateISO(event_date, et),
                thumbnail_url,
                status: "upcoming",
                video_url,
                Products: {
                    create: {
                        name: `"${name}" Bilhete`,
                        description,
                        price: price ?? 0,
                        discount: 0,
                        product_type: 'ticket',
                        restaurant_id,
                        thumbnail: thumbnail_url,
                        prep_time_minutes: 0
                    }
                }
            },
            include: {
                Restaurants: {
                    select: {
                        restaurant_id: true,
                        name: true,
                        location: true
                    }
                },
                Products: true,
                _count: {
                    select: {
                        Products: true,
                        Tickets_Purchased: true
                    }
                }
            }
        });

        return res.status(201).json({
            data: event,
            message: 'Restaurant event created successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    } finally {
        if (!event) return;

        req.events?.global_settings.SILENT$emit("global_settings.change_version.updated");
        req.events?.restaurant_events.emit("restaurant_event.created", event);
    }
};

export async function deleteRestaurantEvent(
    req: IEventfulRequest<{ id: string }>,
    res: Response<API$Types.response<undefined>>
) {
    const { id: _id } = req.params;

    const id = parseInt(_id as string, 10);

    let event: restaurantEventType | null = null;

    try {
        event = await prisma.restaurant_Events.findUnique({
            where: { event_id: id }
        });

        if (!event) {
            return res.status(404).json({
                data: undefined,
                message: 'Restaurant event not found',
                success: false
            });
        }

        await prisma.restaurant_Events.delete({
            where: { event_id: id }
        });

        return res.status(200).json({
            data: undefined,
            message: 'Restaurant event deleted successfully',
            success: true,
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    } finally {
        if (!event) return;

        req.events?.global_settings.SILENT$emit("global_settings.change_version.updated");
        req.events?.restaurant_events.emit("restaurant_event.deleted", event);
    }
};

export async function getAllRestaurantEvents(
    req: Request,
    res: Response<API$Types.response<restaurantEventType[] | undefined>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const restaurant_id = req.query.restaurant_id as string;
        const upcoming = req.query.upcoming === 'true';

        const where: any = {};

        if (restaurant_id) {
            where.restaurant_id = restaurant_id;
        }

        if (upcoming) {
            where.event_date = {
                gte: new Date()
            };
        }

        let [events, total] = await Promise.all([
            prisma.restaurant_Events.findMany({
                where,
                skip,
                take: limit,
                include: {
                    Restaurants: {
                        select: {
                            restaurant_id: true,
                            name: true,
                            location: true
                        }
                    },
                    Products: true,
                    _count: {
                        select: {
                            Products: true,
                            Tickets_Purchased: true
                        }
                    }
                },
                orderBy: { event_date: 'asc' }
            }),
            prisma.restaurant_Events.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        events = events.map(({ price, ...e }) => ({
            price: parseFloat(price.toString()) as any,
            ...e
        }));

        return res.status(!events.length ? 404 : 200).json({
            code: !events.length ? 'API_GENERIC_NOT_FOUND_ERROR' : undefined,
            data: events,
            message: !events.length ? 'There are no registered events' : 'Restaurant events retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: (events.length > 0),
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getBoughtTickets(
    req: Request,
    res: Response<API$Types.response<boughtTicketType[] | undefined>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const event_id = req.query[Madeirense$Enumerators.SearchQueries.event_id] as string;
        const restaurant_id = req.query[Madeirense$Enumerators.SearchQueries.restaurant_id] as string;

        const where: any = {};

        if (event_id) { where.event_id = parseInt(event_id); }
        if (restaurant_id) { where.restaurant_id = parseInt(restaurant_id); }

        const [tickets, total] = await Promise.all([
            await prisma.tickets_Purchased.findMany({
                where,
                skip,
                take: limit,
                include: {
                    Users_Tickets_Purchased_validator_idToUsers: {
                        select: {
                            email: true,
                            name: true,
                            profile_photo: true,
                            phone: true
                        }
                    },
                    Users_Tickets_Purchased_user_idToUsers: {
                        select: {
                            email: true,
                            name: true,
                            profile_photo: true,
                            phone: true
                        }
                    },
                    Orders: {
                        include: {
                            Payments: {
                                select: {
                                    payment_id: true,
                                    payment_method: true,
                                    status: true,
                                    amount: true,
                                    created_at: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    purchased_at: 'desc'
                }
            }),
            prisma.tickets_Purchased.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!tickets.length ? 404 : 200).json({
            code: !tickets.length ? 'API_GENERIC_NOT_FOUND_ERROR' : undefined,
            data: tickets,
            message: !tickets.length ? 'No tickets have been bought until now' : 'Bought tickets retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: (tickets.length > 0),
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getEventsByRestaurant(
    req: Request<{ restaurant_id: string }>,
    res: Response<API$Types.response<restaurantEventType[] | undefined>>
) {
    try {
        const { restaurant_id: _id } = req.params;

        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const upcoming = req.query[Madeirense$Enumerators.SearchQueries.upcoming] === 'true';

        const restaurant_id = parseInt(_id as string, 10);

        const restaurant = await prisma.restaurants.findUnique({
            where: { restaurant_id }
        });

        if (!restaurant) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Restaurant not found',
                success: false
            });
        }

        const where: any = { restaurant_id };

        if (upcoming) {
            where.event_date = {
                gte: new Date()
            };
        }

        const [events, total] = await Promise.all([
            prisma.restaurant_Events.findMany({
                where,
                skip,
                take: limit,
                orderBy: { event_date: 'asc' }
            }),
            prisma.restaurant_Events.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!events.length ? 404 : 200).json({
            data: events,
            message: !events.length ? 'This restaurant has no scheduled/registered events' : 'Restaurant events retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: (events.length > 0),
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getRestaurantEventById(
    req: Request<{ id: string }>,
    res: Response<API$Types.response<restaurantEventType | undefined>>
) {
    try {
        const { id: _id } = req.params;

        const id = parseInt(_id as string, 10);

        const event = await prisma.restaurant_Events.findUnique({
            where: { event_id: id },
            include: {
                Restaurants: {
                    select: {
                        restaurant_id: true,
                        name: true,
                        location: true
                    }
                },
                Products: true,
                _count: {
                    select: {
                        Products: true,
                        Tickets_Purchased: true
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Restaurant event not found',
                success: false
            });
        }

        return res.status(200).json({
            data: event,
            message: 'Restaurant event retrieved successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getUpcomingEvents(
    req: Request,
    res: Response<API$Types.response<restaurantEventType[] | undefined>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            prisma.restaurant_Events.findMany({
                where: {
                    event_date: {
                        gte: new Date()
                    }
                },
                skip,
                take: limit,
                include: {
                    Restaurants: {
                        select: {
                            restaurant_id: true,
                            name: true,
                            location: true
                        }
                    }
                },
                orderBy: { event_date: 'asc' }
            }),
            prisma.restaurant_Events.count({
                where: {
                    event_date: {
                        gte: new Date()
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!events.length ? 404 : 200).json({
            data: events,
            message: !events.length ? 'This restaurant has no upcoming events' : 'Upcoming events retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: (events.length > 0),
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function updateRestaurantEvent(
    req: IEventfulRequest<
        { id: string },
        Partial<{
            name: string,
            description: string,
            event_date: Date,
            start_time: timeType,
            end_time: timeType,
            price?: number,
            thumbnail_url?: string,
            spots?: number,
            video_url: string
            restaurant_id: number
        }>
    >,
    res: Response<API$Types.response<Partial<restaurantEventType> | undefined>>
) {
    const { id: _id } = req.params;

    const {
        name = undefined,
        description = undefined,
        event_date: ed = undefined,
        start_time: st = undefined,
        end_time: et = undefined,
        price = undefined,
        spots = undefined,
        restaurant_id = undefined,
        thumbnail_url = undefined,
        video_url = undefined
    } = req.body;

    const id = parseInt(_id as string, 10);

    let event: restaurantEventType | null = null;

    try {
        const existingEvent = await prisma.restaurant_Events.findUnique({
            where: { event_id: id }
        });

        if (!existingEvent) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Restaurant event not found',
                success: false,
            });
        }

        const event_date = !ed ? undefined : new Date(ed);
        const start_time = (!st || !event_date) ? undefined : toDateISO(event_date, st);
        const end_time = (!et || !event_date) ? undefined : toDateISO(event_date, et);

        const $PARTIAL = {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(event_date && { event_date }),
            ...(start_time && { start_time }),
            ...(end_time && { end_time }),
            ...(price !== undefined && { price }),
            ...(spots !== undefined && { spots }),
            ...(restaurant_id !== undefined && { restaurant_id }),
            ...(thumbnail_url !== undefined && { thumbnail_url }),
            ...(video_url !== undefined && { video_url })
        } as unknown as Partial<Restaurant_Events>;

        event = await prisma.$transaction(async $trx => {
            try {
                const ue = await $trx.restaurant_Events.update({
                    where: { event_id: id },
                    data: $PARTIAL,
                    include: {
                        Restaurants: {
                            select: {
                                restaurant_id: true,
                                name: true,
                                location: true
                            }
                        },
                        Products: true,
                        _count: {
                            select: {
                                Products: true,
                                Tickets_Purchased: true
                            }
                        }
                    }
                });

                if ([price, description, thumbnail_url, name].some(v => v !== undefined)) await $trx.products.update({
                    where: { product_id: ue.Products.find(p => p.product_type === "ticket")?.product_id },
                    data: {
                        ...(name && { name }),
                        ...(description !== undefined && { description }),
                        ...(price !== undefined && { price }),
                        ...(thumbnail_url !== undefined && { thumbnail_url }),
                    },
                });

                return ue;
            } catch (error) {
                throw new Error(`Unable to update Event: ${(error as Error).message}`);
            }
        });

        return res.status(200).json({
            data: req.method === "PATCH" ? $PARTIAL : event,
            message: 'Restaurant event updated successfully',
            success: true,
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    } finally {
        if (!event) return;

        req.events?.global_settings.SILENT$emit("global_settings.change_version.updated");
        req.events?.restaurant_events.emit("restaurant_event.updated", event);
    }
};