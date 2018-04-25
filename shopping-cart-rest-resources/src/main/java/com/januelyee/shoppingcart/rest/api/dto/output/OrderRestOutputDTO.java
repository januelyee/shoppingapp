package com.januelyee.shoppingcart.rest.api.dto.output;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.abstraction.customer.AbstractOrder;

public class OrderRestOutputDTO extends AbstractOrder implements Order {

    public OrderRestOutputDTO(Order order) {
        setOrderItems(order.getOrderItems());
        setStatus(order.getStatus());
    }
}
