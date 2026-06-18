export type contextActionType<Status> = (
    | { type: 'SET_STATUS'; payload: Status }
    | { type: 'CLEAR_ERRORS' }
    | { type: 'RESET' }
    | { type: 'ADD_ERROR'; payload: Error }
);