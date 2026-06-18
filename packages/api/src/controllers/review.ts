import {
    type Request,
    type Response
} from 'express';

import {
    DEFAULT_API_LIST_LIMIT,
    API$Enumerators,
    Madeirense$Enumerators,
    type API$Types,
    type reviewType
} from '@Madeirense/shared';

import {
    handleControllerError
} from './utilities/handlers';

import { prisma } from '../lib/prisma';

import type {
    IAuthenticatedRequest
} from '../interfaces';

// ***************************************************************************************************************

export async function adminDeleteReview(
    req: IAuthenticatedRequest,
    res: Response<API$Types.response<undefined>>
) {
    try {
        const { id: _id } = req.params;

        const id = parseInt(_id as string, 10);

        const review = await prisma.user_Reviews.findUnique({
            where: { review_id: id }
        });

        if (!review) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Review not found',
                success: false
            });
        }

        if (review.user_id !== req.user!.user_id && req.user!.user_role !== 'Admin') {
            return res.status(403).json({
                code: 'UNAUTHORIZED',
                data: undefined,
                message: 'Not authorized to delete this review',
                success: false
            });
        }

        await prisma.user_Reviews.delete({
            where: { review_id: id }
        });

        return res.status(204).json({
            data: undefined,
            message: 'Review deleted successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function createReview(
    req: IAuthenticatedRequest<any, {
        order_id: number,
        rating: number,
        comment: string
    }>,
    res: Response<API$Types.response<reviewType | undefined>>
) {
    try {
        const { order_id, rating, comment } = req.body;

        const order = await prisma.orders.findUnique({
            where: { order_id },
            include: {
                Restaurants: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Order not found',
                success: false,
            });
        }

        if (order.user_id !== req.user!.user_id) {
            return res.status(403).json({
                code: 'UNAUTHORIZED',
                data: undefined,
                success: false,
                message: 'Not authorized to review this order'
            });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({
                code: "BAD_REQUEST",
                data: undefined,
                message: 'Can only review delivered orders',
                success: false
            });
        }

        const existingReview = await prisma.user_Reviews.findFirst({
            where: {
                order_id,
                user_id: req.user!.user_id
            }
        });

        if (existingReview) {
            return res.status(400).json({
                data: undefined,
                message: 'Review already exists for this order',
                success: false
            });
        }

        const review = await prisma.user_Reviews.create({
            data: {
                user_id: req.user!.user_id,
                order_id,
                rating,
                comment
            },
            include: {
                Users: {
                    select: {
                        user_id: true,
                        name: true,
                        profile_photo: true
                    }
                },
                Orders: {
                    select: {
                        order_id: true,
                        total_amount: true,
                        Restaurants: {
                            select: {
                                restaurant_id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function deleteReview(
    req: IAuthenticatedRequest<{ id: string }>,
    res: Response<API$Types.response<undefined>>
) {
    try {
        const { id: _id } = req.params;

        const id = parseInt(_id as string, 10);

        const review = await prisma.user_Reviews.findUnique({
            where: { review_id: id }
        });

        if (!review) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user_id !== req.user!.user_id && req.user!.user_role !== 'Admin') {
            return res.status(403).json({
                code: 'UNAUTHORIZED',
                data: undefined,
                message: 'Not authorized to delete this review',
                success: false
            });
        }

        await prisma.user_Reviews.delete({
            where: { review_id: id }
        });

        return res.json({
            data: undefined,
            message: 'Review deleted successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getAllReviews(
    req: Request,
    res: Response<API$Types.response<reviewType[] | undefined>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const rating = req.query[Madeirense$Enumerators.SearchQueries.rating] as string;
        const user_id = req.query[Madeirense$Enumerators.SearchQueries.user_id] as string;
        const order_id = req.query[Madeirense$Enumerators.SearchQueries.order_id] as string;

        const where: any = {};

        if (rating) {
            where.rating = parseInt(rating);
        }

        if (user_id) {
            where.user_id = user_id;
        }

        if (order_id) {
            where.order_id = order_id;
        }

        const [reviews, total] = await Promise.all([
            prisma.user_Reviews.findMany({
                where,
                skip,
                take: limit,
                include: {
                    Users: {
                        select: {
                            user_id: true,
                            name: true,
                            profile_photo: true
                        }
                    },
                    Orders: {
                        select: {
                            order_id: true,
                            total_amount: true,
                            Restaurants: {
                                select: {
                                    restaurant_id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user_Reviews.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!reviews.length ? 404 : 200).json({
            data: reviews,
            message: !reviews.length ? 'There are no submitted reviews' : 'Reviews retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: (reviews.length > 0),
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getReviewById(
    req: Request<{ id: string }>,
    res: Response<API$Types.response<reviewType | undefined>>
) {
    try {
        const { id: _id } = req.params;

        const id = parseInt(_id as string, 10);

        const review = await prisma.user_Reviews.findUnique({
            where: { review_id: id },
            include: {
                Users: {
                    select: {
                        user_id: true,
                        name: true,
                        profile_photo: true
                    }
                },
                Orders: {
                    include: {
                        Restaurants: {
                            select: {
                                restaurant_id: true,
                                name: true,
                                location: true
                            }
                        },
                        Order_Items: {
                            include: {
                                Products: {
                                    select: {
                                        product_id: true,
                                        name: true,
                                        price: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!review) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Review not found',
                success: false
            });
        }

        return res.status(200).json({
            data: review,
            message: 'Review retrieved successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getUserReviews(
    req: IAuthenticatedRequest,
    res: Response<API$Types.response<reviewType[] | undefined>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            prisma.user_Reviews.findMany({
                where: { user_id: req.user!.user_id },
                skip,
                take: limit,
                include: {
                    Orders: {
                        select: {
                            order_id: true,
                            total_amount: true,
                            Restaurants: {
                                select: {
                                    restaurant_id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user_Reviews.count({
                where: { user_id: req.user!.user_id }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!reviews.length ? 404 : 200).json({
            data: reviews,
            message: !reviews.length ? 'No user reviews were found' : 'User reviews retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            },
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getRestaurantReviews(
    req: Request<{ restaurant_id: string }>,
    res: Response<API$Types.response<{ 
        average_rating: number,
        reviews: reviewType[]
    } | undefined>>
) {
    try {
        const { restaurant_id: _id } = req.params;

        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

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

        const [reviews, total, avgRating] = await Promise.all([
            prisma.user_Reviews.findMany({
                where: {
                    Orders: {
                        restaurant_id
                    }
                },
                skip,
                take: limit,
                include: {
                    Users: {
                        select: {
                            user_id: true,
                            name: true,
                            profile_photo: true
                        }
                    },
                    Orders: {
                        select: {
                            order_id: true,
                            total_amount: true,
                            created_at: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user_Reviews.count({
                where: {
                    Orders: {
                        restaurant_id
                    }
                }
            }),
            prisma.user_Reviews.aggregate({
                where: {
                    Orders: {
                        restaurant_id
                    }
                },
                _avg: {
                    rating: true
                }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(!reviews.length ? 404 : 200).json({
            data: {
                average_rating: avgRating._avg.rating || 0,
                reviews,
            },
            success: true,
            message: !reviews.length ? 'This restaurant has no recorded reviews' : 'Restaurant reviews retrieved successfully',
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            } 
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function updateReview(
    req: IAuthenticatedRequest<
        { id: string },
        {
            rating: number,
            comment: string
        }
    >,
    res: Response<API$Types.response<Partial<reviewType> | undefined>>
) {
    try {
        const { id: _id } = req.params;
        const { rating, comment } = req.body;

        const id = parseInt(_id as string, 10);

        const existingReview = await prisma.user_Reviews.findUnique({
            where: { review_id: id }
        });

        if (!existingReview) {
            return res.status(404).json({
                code: 'API_GENERIC_NOT_FOUND_ERROR',
                data: undefined,
                message: 'Review not found',
                success: false
            });
        }

        if (existingReview.user_id !== req.user!.user_id) {
            return res.status(403).json({
                code: 'UNAUTHORIZED',
                data: undefined,
                message: 'Not authorized to update this review',
                success: false
            });
        }

        const $PARTIAL = {
            ...(rating && { rating }),
            ...(comment !== undefined && { comment })
        };

        const updatedReview = await prisma.user_Reviews.update({
            where: { review_id: id },
            data: $PARTIAL,
            include: {
                Users: {
                    select: {
                        user_id: true,
                        name: true,
                        profile_photo: true
                    }
                },
                Orders: {
                    select: {
                        order_id: true,
                        Restaurants: {
                            select: {
                                restaurant_id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: req.method === "PATCH" ? $PARTIAL : updatedReview
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};