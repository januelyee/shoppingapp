package com.januelyee.shoppingcart.domain.template.customer;

import java.util.List;

/**
 * Represents an order from shopping.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface Order {
    OrderStatus getStatus();
    void setStatus(OrderStatus status);

    List<OrderItem> getOrderItems();
    void setOrderItems(List<OrderItem> items);

    void addOrderItem(OrderItem item);
    void removeItem(String itemCode);
}
