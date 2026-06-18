import {
    type Response
} from 'express';

import {
    DB$Enumerators,
    type Delivery_Locations,
    type Orders,
    type Products
} from '@Madeirense/database';

import {
    DEFAULT_API_LIST_LIMIT,
    Madeirense$Enumerators,
    type API$Types,
    type countEntryType,
    type dateIntervalsType,
    type orderRevenueType
} from '@Madeirense/shared';

import { prisma } from '../lib/prisma';

import {
    handleControllerError
} from './utilities/handlers';

import type { IAuthenticatedRequest } from 'interfaces';

// ***************************************************************************************************************

function errorHandler(
    res: Response<API$Types.response<any>>,
    error: unknown,
    message: string = ''
) {
    switch ((error as Error).message) {
        case ('UNIMPLEMENTED' as API$Types.errorCode):
            return res.status(501).json({
                code: 'UNIMPLEMENTED',
                data: undefined,
                message,
                success: false
            });

        default: return handleControllerError(
            res,
            error
        );
    };
};

export async function getCountPerProperty(
    req: IAuthenticatedRequest<{
        column: string,
        table: keyof typeof DB$Enumerators.Tables,
    }>,
    res: Response<API$Types.response<countEntryType[] | undefined>>
) {
    const {
        column,
        table
    } = req.params;

    try {
        switch (table) {
            case 'Orders':
                switch (column) {
                    case ('status' as keyof Orders):
                        return res.status(200).json({
                            data: (await prisma.orders.groupBy({
                                by: 'status',
                                _count: true
                            })).map(({ _count: data, status }) => ({
                                data,
                                id: (status ?? '').toString()
                            })),
                            message: 'Order count per status retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            case 'Products':
                switch (column) {
                    case ('product_type' as keyof Products):
                        return res.status(200).json({
                            data: (await prisma.products.groupBy({
                                by: 'product_type',
                                _count: true
                            })).map(({ _count: data, product_type }) => ({
                                data,
                                id: (product_type ?? '').toString()
                            })),
                            message: 'Product count per type retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            default:
                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
        };
    } catch (error) {
        return errorHandler(
            res,
            error,
            `The count for table ${table}'s ${column} has not been implemented yet`
        );
    }
};

export async function getReport<T = any>(
    req: IAuthenticatedRequest<{
        fact: keyof typeof Madeirense$Enumerators.StatisticsParameters.Fact,
        table: keyof typeof DB$Enumerators.Tables,
    }>,
    res: Response<API$Types.response<T | undefined>>
) {
    const {
        fact,
        table
    } = req.params;

    try {
        switch (table) {
            case 'Orders':
                switch (fact) {
                    case (Madeirense$Enumerators.StatisticsParameters.Fact.revenue):
                        const interval: dateIntervalsType = (req.query[Madeirense$Enumerators.SearchQueries.interval] as dateIntervalsType) ?? 'monthly';
                        const year = parseInt(req.query[Madeirense$Enumerators.SearchQueries.year] as string ?? new Date().getFullYear().toString());
                        const month = parseInt(req.query[Madeirense$Enumerators.SearchQueries.month] as string ?? (new Date().getMonth() + 1).toString(), 10);

                        let base_select = `
                            COUNT(*) as orders,
                            SUM(total_amount) as total,
                            SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as factual
                        `;

                        let revenue;

                        switch (interval) {
                            case 'daily':
                                revenue = ((await prisma.$queryRawUnsafe(`
                                    SELECT 
                                        DATE(created_at) as date,
                                        ${base_select}
                                    FROM Orders
                                    WHERE YEAR(created_at) = ${year} AND MONTH(created_at) = ${month}
                                    GROUP BY DATE(created_at)
                                    ORDER BY date DESC
                                `)) as (orderRevenueType & { date: Date })[]).map(({ date, ...rest }) => ({ ...rest, day: parseInt(date.toISOString().split('T')[0]?.split('-')[2] as string) })); break;

                            case 'monthly':
                                revenue = ((await prisma.$queryRawUnsafe(`
                                    SELECT 
                                        DATE_FORMAT(created_at, '%m') as month,
                                        ${base_select}
                                    FROM Orders
                                    WHERE YEAR(created_at) = ${year}
                                    GROUP BY DATE_FORMAT(created_at, '%m')
                                    ORDER BY month DESC
                                `)) as (orderRevenueType & { month: string })[]).map(({ month, ...rest }) => ({ month: parseInt(month), ...rest })); break;

                            case 'yearly':
                                revenue = (await prisma.$queryRawUnsafe(`
                                    SELECT 
                                        YEAR(created_at) as year,
                                        ${base_select}
                                    FROM Orders
                                    WHERE YEAR(created_at) = ${year}
                                    GROUP BY YEAR(created_at)
                                    ORDER BY year DESC
                                `)) as (orderRevenueType & { year: number })[]; break;

                            default: throw new Error('Unknown interval type');
                        };

                        return res.status(200).json({
                            data: ((revenue).map(({ total, factual, ...rest }) => ({
                                ...rest,
                                factual: parseInt(`${factual}`),
                                total: parseInt(`${total}`),
                            })) as T),
                            message: 'Order revenue retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            default:
                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
        };
    } catch (error) {
        return errorHandler(
            res,
            error,
            `Cannot report ${fact} for ${table} as it has not been implemented yet`
        );
    }
};

export async function getRelationCount(
    req: IAuthenticatedRequest<{
        relation: keyof typeof DB$Enumerators.Tables,
        table: keyof typeof DB$Enumerators.Tables,
    }>,
    res: Response<API$Types.response<countEntryType[] | undefined>>
) {
    const {
        table,
        relation
    } = req.params;

    try {
        switch (table) {
            case 'Orders': {
                switch (relation) {
                    case 'Restaurants':
                        const restaurant_id = parseInt(req.query[Madeirense$Enumerators.SearchQueries.restaurant_id] as string ?? "") ?? 0;

                        if (!restaurant_id) {
                            return res.status(400).json({
                                code: 'BAD_REQUEST',
                                data: undefined,
                                message: 'The restaurant_id property must be specified in the query for this statistic count',
                                success: false
                            });
                        }

                        if (!(await prisma.restaurants.findUnique({
                            where: {
                                restaurant_id
                            }
                        }))) {
                            return res.status(404).json({
                                code: 'API_GENERIC_NOT_FOUND_ERROR',
                                data: undefined,
                                message: 'Restaurant not found',
                                success: false
                            });
                        };

                        return res.status(200).json({
                            data: (
                                (await prisma.orders.groupBy({
                                    by: 'status',
                                    where: {
                                        restaurant_id
                                    },
                                    _count: true
                                })).map(({ _count: data, status }) => ({
                                    data,
                                    id: (status ?? '').toString()
                                }))
                            ),
                            message: 'Restaurant orders statistic retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }
            }
            case 'Restaurants':
                switch (relation) {
                    case 'Orders':
                        return res.json({
                            data: (await prisma.orders.groupBy({
                                by: 'restaurant_id',
                                _count: true
                            })).map(({ _count: data, restaurant_id }) => ({
                                data,
                                id: parseInt(restaurant_id.toString())
                            })),
                            message: 'All restaurant orders statistic retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            default:
                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
        };
    } catch (error) {
        return errorHandler(
            res,
            error,
            `The count for table ${table} and relation ${relation} have not been implemented yet`
        );
    }
};

export async function getRelationActionCount<T = any>(
    req: IAuthenticatedRequest<{
        action: keyof typeof Madeirense$Enumerators.StatisticsParameters.Actions,
        relation: keyof typeof DB$Enumerators.Tables,
        table: keyof typeof DB$Enumerators.Tables,
    }>,
    res: Response<API$Types.response<T | undefined>>
) {
    const {
        action,
        relation,
        table
    } = req.params;

    const strict = (req.query[Madeirense$Enumerators.SearchQueries.strict] as string) === 'true';

    try {
        switch (table) {
            case 'Coupons':
                switch (relation) {
                    case 'Orders':
                        switch (action) {
                            case Madeirense$Enumerators.StatisticsParameters.Actions.use:
                                return res.status(200).json({
                                    data: (await prisma.$queryRawUnsafe(`
                                        SELECT
                                            Coupons.coupon_id,
                                            Coupons.code,
                                            Coupons.discount,
                                            Coupons.expires_at,
                                            COUNT(Orders.order_id) as orders
                                        FROM Coupons
                                        INNER JOIN Orders ON Orders.coupon_id = Coupons.coupon_id
                                        ${(strict) ? `WHERE Orders.state = 'delivered'` : ''}
                                        GROUP BY Coupons.code
                                        ORDER BY orders DESC
                                    `)) as T,
                                    message: 'Coupon use count retrieved successfully',
                                    success: true
                                });

                            default:
                                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                        }

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            default:
                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
        };
    } catch (error) {
        return errorHandler(
            res,
            error,
            `The count for table ${table} with relation to ${relation} and action ${action} have not been implemented yet`
        );
    }
};

export async function getTopRelation(
    req: IAuthenticatedRequest<{
        table: keyof typeof DB$Enumerators.Tables,
        relation: keyof typeof DB$Enumerators.Tables,
    }>,
    res: Response<API$Types.response<any | undefined>>
) {
    const {
        table,
        relation
    } = req.params;

    const group_by = (req.query[Madeirense$Enumerators.SearchQueries.group_by] ?? 'neighborhood') as (keyof Delivery_Locations);
    const quantity = parseInt((req.query[Madeirense$Enumerators.SearchQueries.quantity] ?? DEFAULT_API_LIST_LIMIT.toString()) as string);
    const strict = (req.query[Madeirense$Enumerators.SearchQueries.strict] as string) === 'true';

    try {
        switch (table) {
            case 'Users':
                switch (relation) {
                    case 'Orders':
                        const couriers = ((await prisma.$queryRawUnsafe(`
                            SELECT 
                                Users.name,
                                Users.email,
                                Users.phone,
                                Users.profile_photo,
                                CAST(COUNT(Orders.order_id) AS CHAR) as orders
                            FROM Users
                            INNER JOIN Orders ON Users.user_id = Orders.courier_id
                            WHERE Users.user_role = 'Driver'${strict ? ` AND Orders.status = 'delivered'` : ''}
                            GROUP BY Users.name
                            ORDER BY orders DESC
                            LIMIT ${quantity}
                        `)) as []);

                        return res.json({
                            data: (couriers as (object & { orders: string })[]).map(({ orders: od, ...row }) => ({
                                ...row,
                                orders: Number(od)
                            })),
                            message: 'Top order locations retrieved successfully',
                            success: true,
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            case 'Delivery_Locations':
                switch (relation) {
                    case 'Orders':
                        const top_locations = ((await prisma.$queryRawUnsafe(`
                            SELECT 
                                Delivery_Locations.location_id,
                                Delivery_Locations.city,
                                CASE 
                                    WHEN Delivery_Locations.neighborhood IS NULL OR Delivery_Locations.neighborhood = '' THEN 'Diversas'
                                    ELSE Delivery_Locations.neighborhood
                                END as neighborhood,
                                Delivery_Locations.state,
                                Delivery_Locations.${group_by},
                                CAST(COUNT(Orders.order_id) as CHAR) as orders
                            FROM Delivery_Locations
                            ${strict ? `WHERE Orders.status = 'delivered'` : ''}
                            INNER JOIN Orders ON Delivery_Locations.location_id = Orders.delivery_address
                            GROUP BY Delivery_Locations.${group_by}
                            ORDER BY orders DESC
                            LIMIT ${quantity}
                        `)) as []);

                        return res.json({
                            data: (top_locations as (object & { orders: string })[]).map(({ orders: od, ...row }) => ({
                                ...row,
                                orders: Number(od)
                            })),
                            message: 'Top order locations retrieved successfully',
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            case 'Products':
                switch (relation) {
                    case 'Orders':
                        const top_sellers = await prisma.$queryRawUnsafe(`
                            SELECT
                                Products.product_id,
                                Products.name,
                                Products.thumbnail,
                                Products.price,
                                Products.delisted,
                                Products.discount,
                                Products.product_type,
                                Products.restaurant_id,
                                CAST(COUNT(Order_Items.product_id) as CHAR) as orders
                            FROM Products
                            INNER JOIN Order_Items ON Products.product_id = Order_Items.product_id
                            INNER JOIN Orders ON Order_Items.order_id = Orders.order_id
                            ${strict ? `WHERE Products.delisted = 0` : ''}
                            GROUP BY Products.name
                            ORDER BY orders DESC
                            LIMIT ${quantity}
                        `);

                        return res.json({
                            data: (top_sellers as (object & { orders: string })[]).map(({ orders: od, ...row }) => ({
                                ...row,
                                orders: Number(od)
                            })),
                            message: `Top ${quantity} products retrieved successfully`,
                            success: true
                        });

                    default:
                        throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
                }

            default:
                throw new Error('UNIMPLEMENTED' as API$Types.errorCode);
        };
    } catch (error) {
        return errorHandler(
            res,
            error,
            `Cannot get top ${relation} for ${table} as it hasn't been implemented yet`
        );
    }
};