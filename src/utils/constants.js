const constants = {
    ACCOUNT_STATUS_DELETED: 'deleted',
    ACCOUNT_STATUS_ACTIVE: 'active',
    ACCOUNT_STATUS_INACTIVE: 'inactive',
    ACCOUNT_STATUS_PENDING: 'pending',
    AVERAGE_DELIVERY_SPPED: 30,
    PREPARING_TIME: 15,
    ORDER_STATUS_PREPARING: 'preparing',
    ORDER_STATUS_DELIVERING: 'delivering',
    ORDER_STATUS_DELIVERED: 'delivered',
    ORDER_STATUS_READY: 'ready',
    ORDER_STATUS_PENDING: 'pending',
    ORDER_STATUS_CANCELED: 'canceled',
    ORDER_STATUS_REFUSE : 'refused',
    ORDER_PAYMENT_STATUS_UNPAID: 'unpaid',
    ORDER_ITEM_PER_PAGE: 10,
    ORDER_PAYMENT_STATUS_PAID: 'paid',
    ORDER_PAYMENT_METHOD_CARD: 'card',
    ORDER_PAYMENT_METHOD_CASH: 'cash',
    DELIVERY_BASE_FEE: 10000,
    DELIVERY_FEE_PER_KM: 7000,
    DELIVERY_FEE_PER_KM_LESS_ONE: 7000,
    DELIVERY_FEE_PER_KM_GREAT_THAN_FIVE: 10000,
    DELIVERY_FEE_PER_KM_GREATER_TEN: 20000,

    isPhoneNumber(input) {
        var stripped = input.replace(/\D/g, '');
        if (stripped.length !== input.length) {
            return false;
        } else {
            return true;
        }
    }
}

module.exports = constants;


