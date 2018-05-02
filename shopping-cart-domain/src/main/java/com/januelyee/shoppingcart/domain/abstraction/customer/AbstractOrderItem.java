package com.januelyee.shoppingcart.domain.abstraction.customer;

import com.januelyee.shoppingcart.domain.template.customer.OrderItem;
import com.januelyee.shoppingcart.domain.template.customer.OrderItemStatus;

public abstract class AbstractOrderItem extends AbstractInventoryItemWrapper implements OrderItem {

    private OrderItemStatus status = OrderItemStatus.PENDING_INSPECTION;

    @Override
    public OrderItemStatus getStatus() {
        return status;
    }

    @Override
    public void setStatus(OrderItemStatus status) {
        this.status = status;
    }
}
