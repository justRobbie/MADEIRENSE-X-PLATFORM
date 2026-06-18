export type eventActionType = 'created' | 'updated' | 'deleted';

export type eventOptionsType = {
    user_id: number
} & Partial<{}>;