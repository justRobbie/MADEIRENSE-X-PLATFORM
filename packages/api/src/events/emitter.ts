import EventEmitter from 'events';

// ***************************************************************************************************************

class AppEmitter<D, T extends string> extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20); // TODO: Increase if you have many listeners
    }

    // Helper methods for type safety and better IDE support
    override emit(event: T, ...data: D[]) {
        return super.emit(event, ...data);
    }

    SILENT$emit(event: T) {
        return super.emit(event, null);
    }

    override on(event: T, listener: (...args: D[]) => void) {
        return super.on(event, listener);
    }

    SILENT$on(event: T, listener: () => void) {
        return super.on(event, listener);
    }
}

export default AppEmitter;