export type facebookProfileType = {
    id: string;
    displayName: string;
    emails: ({
        value: string
    })[];
    photos: ({
        value: string
    })[];
};

export type googleProfileType = {
    id: string;
    displayName: string;
    emails: ({
        value: string;
        verified: boolean
    })[];
    photos: ({
        value: string
    })[];
};

export type JWTPayloadType = {
    userId: string;
    email: string;
    role: string;
};