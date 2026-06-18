import {
    type Request,
    type Response
} from 'express';

import {
    Prisma
} from '@Madeirense/database';

import {
    DEFAULT_API_LIST_LIMIT,
    API$Enumerators,
    type API$Types,
    type Madeirense$Types,
    type productCommentType
} from '@Madeirense/shared';

import { Messages } from './utilities/enumerators';

import { prisma } from '../lib/prisma';

import {
    handleControllerError
} from './utilities/handlers';

import type {
    IAuthenticatedRequest
} from '../interfaces';

// ***************************************************************************************************************

export async function adminDeleteComment(
    req: IAuthenticatedRequest<{ id: string }>,
    res: Response<API$Types.response<undefined>>
) {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const comment = await prisma.user_Comments.findUnique({
            where: {
                comment_id: parseInt(req.params.id as string)
            }
        });

        if (!comment) return res.status(404).json({
            data: undefined,
            message: 'Comment not found',
            success: false
        });

        if (
            (comment.user_id !== req.user.user_id) &&
            (req.user.user_role !== 'Admin')
        ) return res.status(403).json({
            data: undefined,
            message: 'Not authorized to delete this comment',
            success: false
        });

        await prisma.user_Comments.delete({
            where: {
                comment_id: parseInt(req.params.id as string)
            }
        });

        return res.json({
            data: undefined,
            message: 'Comment deleted successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function createComment(
    req: IAuthenticatedRequest<any, {
        product_id: number,
        comment: string
    }>,
    res: Response<API$Types.response<productCommentType | undefined>>
) {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const {
            product_id,
            comment
        } = req.body;

        const product = await prisma.products.findUnique({
            where: {
                product_id
            },
            include: {
                Restaurants: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!product) return res.status(400).json({
            data: undefined,
            message: 'Product not found',
            success: false
        });

        const newComment = await prisma.user_Comments.create({
            data: {
                user_id: req.user!.user_id,
                product_id,
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
                Products: {
                    select: {
                        product_id: true,
                        name: true,
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

        req.events?.user_comments.emit(
            'user_comments.created',
            newComment
        );

        return res.status(201).json({
            data: newComment,
            message: 'Comment created successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function deleteComment(
    req: IAuthenticatedRequest<{ id: string }>,
    res: Response<API$Types.response<undefined>>
) {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const comment = await prisma.user_Comments.findUnique({
            where: {
                comment_id: parseInt(req.params.id as string)
            }
        });

        if (!comment) return res.status(404).json({
            data: undefined,
            message: 'Comment not found',
            success: false
        });

        if (
            (comment.user_id !== req.user.user_id) &&
            (req.user.user_role !== 'Admin')
        ) return res.status(403).json({
            data: undefined,
            message: 'Not authorized to delete this comment',
            success: false
        });

        await prisma.user_Comments.delete({
            where: {
                comment_id: parseInt(req.params.id as string)
            }
        });

        return res.json({
            data: undefined,
            message: 'Comment deleted successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getAllComments(
    req: Request,
    res: Response<API$Types.response<productCommentType[]>>
) {
    try {
        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const {
            product_id,
            user_id,
        } = req.query as Madeirense$Types.searchQueryRecord;

        const where: Prisma.User_CommentsWhereInput = {};

        if (product_id) {
            where.product_id = parseInt(product_id as string);
        }

        if (user_id) {
            where.user_id = parseInt(user_id as string);
        }

        const [comments, total] = await Promise.all([
            prisma.user_Comments.findMany({
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
                    Products: {
                        select: {
                            product_id: true,
                            name: true,
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
            prisma.user_Comments.count({
                where
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.json({
            success: true,
            message: 'Comments retrieved successfully',
            data: comments,
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

export async function getCommentById(
    req: Request<{ id: string }>,
    res: Response<API$Types.response<productCommentType | undefined>>
) {
    try {
        const comment = await prisma.user_Comments.findUnique({
            where: {
                comment_id: parseInt(req.params.id as string)
            },
            include: {
                Users: {
                    select: {
                        user_id: true,
                        name: true,
                        profile_photo: true
                    }
                },
                Products: {
                    include: {
                        Restaurants: {
                            select: {
                                restaurant_id: true,
                                name: true,
                                location: true
                            }
                        }
                    }
                }
            }
        });

        if (!comment) return res.status(404).json({
            data: undefined,
            message: 'Comment not found',
            success: false
        });

        return res.json({
            data: comment,
            message: 'Comment retrieved successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};

export async function getUserComments(
    req: IAuthenticatedRequest,
    res: Response<API$Types.response<productCommentType[]>>
) {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const page = parseInt((req.query[API$Enumerators.SearchQueries.page] as string) ?? '1');
        const limit = parseInt((req.query[API$Enumerators.SearchQueries.limit] as string) ?? DEFAULT_API_LIST_LIMIT.toString());

        const skip = (page - 1) * limit;

        const {
            user_id
        } = req.user;

        const [
            comments,
            total
        ] = await Promise.all([
            prisma.user_Comments.findMany({
                where: {
                    user_id
                },
                skip,
                take: limit,
                include: {
                    Products: {
                        select: {
                            product_id: true,
                            name: true,
                            Restaurants: {
                                select: {
                                    restaurant_id: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.user_Comments.count({
                where: {
                    user_id
                }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.json({
            success: true,
            message: 'User comments retrieved successfully',
            data: comments,
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

export async function updateComment(
    req: IAuthenticatedRequest<
        {
            id: string
        },
        {
            comment: string
        }
    >,
    res: Response<API$Types.response<productCommentType | undefined>>
) {
    try {
        if (!req.user) throw new Error(Messages.INACTIVE_SESSION);

        const {
            user_id
        } = req.user;

        const { comment } = req.body;

        const comment_id = parseInt(req.params.id as string);

        const existingComment = await prisma.user_Comments.findUnique({
            where: { 
                comment_id
            }
        });

        if (!existingComment) return res.status(404).json({
            data: undefined,
            message: 'Comment not found',
            success: false
        });
        
        if (existingComment.user_id !== user_id) {
            return res.status(403).json({
                data: undefined,
                message: 'Not authorized to update this comment',
                success: false
            });
        }

        const updatedComment = await prisma.user_Comments.update({
            where: { 
                comment_id
            },
            data: {
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
                Products: {
                    select: {
                        product_id: true,
                        name: true,
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

        return res.json({
            data: updatedComment,
            message: 'Comment updated successfully',
            success: true
        });
    } catch (error) {
        return handleControllerError(
            res,
            error
        );
    }
};