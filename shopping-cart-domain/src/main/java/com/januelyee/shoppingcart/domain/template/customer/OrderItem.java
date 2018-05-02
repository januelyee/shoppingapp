package com.januelyee.shoppingcart.domain.template.customer;

/**
 * Holds inventory items inside an order.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface OrderItem extends InventoryItemWrapper {
    OrderItemStatus getStatus();
    void setStatus(OrderItemStatus status);
}
