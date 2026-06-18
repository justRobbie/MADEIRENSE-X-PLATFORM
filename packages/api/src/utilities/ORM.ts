export namespace Prisma$Utilities {
    export namespace Inclusions {
        export namespace DeliveryLocations {
            export const Address = {
                select: {
                    name: true,
                    address: true,
                    latitude: true,
                    longitude: true
                }
            };
        }

        export namespace Resort_Chat_Messages {
            export const Data = {
                'Resort_Bookings': {
                    select: {
                        user_id: true,
                    }
                },
                'Users': {
                    select: {
                        user_id: true,
                        email: true,
                        name: true,
                        user_role: true,
                        phone: true,
                        profile_photo: true
                    }
                }
            }
        }

        export namespace Resort_Rooms {
            export const Data = {
                'Resort_Room_Amenities': {
                    select: {
                        'Resort_Amenities': {
                            select: {
                                'name': true
                            }
                        }
                    }
                },
                'Resort_Room_Bed_Options': {
                    select: {
                        'quantity': true,
                        'Resort_Room_Bed_Types': {
                            select: {
                                'name': true
                            }
                        }
                    }
                },
            }
        }

        export namespace Resort_Bookings {
            export const Data = {
                'Resort_Booking_Cancellations': true,
                'Resort_Booking_Payments': true,
                'Resort_Rooms': {
                    include: Prisma$Utilities.Inclusions.Resort_Rooms.Data
                }
            }
        }

        export namespace Restaurants {
            export const Data = {
                'Products': {
                    select: {
                        product_id: true,
                        name: true,
                        price: true,
                        discount: true
                    }
                },
                'Delivery_Locations': {
                    select: {
                        location_id: true,
                        address: true,
                        latitude: true,
                        longitude: true
                    }
                },
                'Restaurant_Hours': {
                    select: {
                        hours_id: true,
                        day_of_week: true,
                        is_closed: true,
                        opening_time: true,
                        closing_time: true
                    }
                },
                _count: {
                    select: {
                        Orders: true,
                        Products: true
                    }
                },
            }

            export const PartialData = {
                'Delivery_Locations': {
                    select: {
                        location_id: true,
                        address: true,
                        latitude: true,
                        longitude: true
                    }
                },
                'Restaurant_Hours': {
                    select: {
                        day_of_week: true,
                        is_closed: true,
                        opening_time: true,
                        closing_time: true
                    }
                },
                'Restaurant_Events': {
                    where: {
                        event_date: {
                            gte: new Date()
                        }
                    },
                    orderBy: { event_date: 'asc' }
                }
            }
        }

        export namespace Users {
            export const Data = {
                select: {
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }

            export const Profile = {
                'Delivery_Locations': true,
                'Favorites': {
                    select: {
                        product_id: true
                    }
                },
                'Push_Notification_Subscriptions': {
                    select: {
                        auth: true,
                        expiration_time: true,
                        p256dh: true,
                        subscription_id: true,
                        target_endpoint: true
                    }
                }
            }
        }

        export namespace Orders {
            export const Data = {
                'Payments': {
                    select: {
                        payment_id: true,
                        payment_method: true,
                        status: true
                    }
                },
                'Users_Orders_user_idToUsers': Prisma$Utilities.Inclusions.Users.Data,
                'Users_Orders_courier_idToUsers': {
                    include: {
                        'Courier_Positions': {
                            select: {
                                longitude: true,
                                latitude: true,
                                recorded_at: true,
                                speed_kph: true
                            }
                        }
                    }
                },
                'Restaurants': {
                    include: {
                        'Delivery_Locations': Prisma$Utilities.Inclusions.DeliveryLocations.Address,
                    }
                },
                'Delivery_Locations': Prisma$Utilities.Inclusions.DeliveryLocations.Address,
                'Order_Items': {
                    include: {
                        'Products': true
                    }
                }
            }
        }
    }
};