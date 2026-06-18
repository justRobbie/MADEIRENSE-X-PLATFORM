import {
    Resort_Booking_History,
    Resort_Booking_Payments_payment_method,
    Resort_Booking_Payments_status,
    type Resort_Chat_Messages,
    type Resort_Booking_Cancellations,
    type Resort_Booking_Payments,
    type Resort_Bookings,
    type Resort_Rooms,
    type Users
} from "@Madeirense/database/browser";

// ***************************************************************************************************************

export type addRoomBodyType = {
    name: string,
    price_per_night: number,
    quantity: number,
    amenities: number[],
    bedTypes: ({
        bed_type_id: number,
        quantity: number
    })[],
    thumbnail_url_collection?: string[],
    video_url_collection?: string[],
};

export type bookRoomBodyType = {
    room_id: number,
    check_in: Date,
    check_out: Date,
    guests: number,
    amount: string,
    payment_method: Resort_Booking_Payments_payment_method,
    payment_status: Resort_Booking_Payments_status
};

export type bookingHistoryType = Resort_Booking_History & {
    Users: Partial<Users>
};

export type bookingType = Resort_Bookings & {
    Resort_Booking_Payments?: Resort_Booking_Payments;
    Resort_Rooms: resortRoomType;
    Resort_Booking_Cancellations?: Resort_Booking_Cancellations | null;
};

export type createResortBodyType = {
    name: string,
    location: number,
    thumbnail_url?: string,
    video_url?: string,
};

export type resortChatEntryType = (
    Resort_Chat_Messages &
    {
        Resort_Bookings: Partial<Resort_Bookings>
        Users: Partial<Users>
    }
);

export type resortRoomType = Resort_Rooms & {
    Resort_Room_Amenities: {
        Resort_Amenities: {
            name: string;
        };
    }[];
    Resort_Room_Bed_Options: {
        quantity: number;
        Resort_Room_Bed_Types: {
            name: string;
        };
    }[];
};

export type resortPropertyType = (
    | 'amenity'
    | 'bedType'
);

export type updateBookingBodyType = Partial<Omit<bookRoomBodyType, (
    | 'status'
)>>;

export type updateRoomBodyType = Partial<Omit<addRoomBodyType, (
    | 'amenities'
    | 'bedTypes'
    | 'thumbnail_url_collection'
    | 'video_url_collection'
)>>;