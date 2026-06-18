import ChatMessagesEventEmitter from "./chatMessages";
import CouponsEventEmitter from "./coupon";
import OrderEventEmitter from "./orders";
import ProductsEventEmitter from "./product";
import RestaurantEventEmitter from "./restaurant";
import RestaurantEventsEventEmitter from "./restaurantEvent";
import UsersEventEmitter from "./user";
import WorkstationsEventEmitter from "./workstations";
import GlobalSettingsEventEmitter from "./globalSettings";
import CourierPositionsEventEmitter from "./courierPositionsEvents";
import UserCommentsEventEmitter from "./userComments";

// ***************************************************************************************************************

const Events = {
    "chat_messages": ChatMessagesEventEmitter,
    "coupons": CouponsEventEmitter,
    "courier_positions": CourierPositionsEventEmitter,
    "global_settings": GlobalSettingsEventEmitter,
    "orders": OrderEventEmitter,
    "products": ProductsEventEmitter,
    "restaurants": RestaurantEventEmitter,
    "restaurant_events": RestaurantEventsEventEmitter,
    "users": UsersEventEmitter,
    "user_comments": UserCommentsEventEmitter,
    "workstations": WorkstationsEventEmitter
};

export default Events;