/* eslint-disable no-restricted-globals */
self.addEventListener('push', event => {
    const payload = event.data.json();

    const {
        notificationId = ""
    } = payload ?? {};

    switch (true) {
        case (notificationId.includes("MXP$APP_PROPERTY")):
        case (notificationId.includes("MXP$BACK_OFFICE")):
        case (notificationId.includes("MXP$COURIER_POSITION")):
        case (
            [
                "CHAT_REPLY",
                "HELLO_WORLD",
                "ORDER_DRIVER_ASSIGNATION",
                "ORDER_DRIVER_REASSIGNATION",
                "ORDER_STATUS_UPDATE",
                "PRODUCT_COMMENT",
                "SAMPLE"
            ].map(k => `MXP$${k}`).includes(notificationId)
        ):
            self.clients.matchAll().then(
                clients => clients.forEach(client => client.postMessage(payload))
            );

            break;

        default:
            event.waitUntil(self.registration.showNotification(
                payload.title,
                {
                    body: payload.message
                }
            ));

            break;
    };
});