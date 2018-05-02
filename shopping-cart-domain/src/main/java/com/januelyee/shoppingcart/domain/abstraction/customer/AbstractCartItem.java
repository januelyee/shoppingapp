package com.januelyee.shoppingcart.domain.abstraction.customer;

import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.customer.CartItemStatus;

public abstract class AbstractCartItem extends AbstractInventoryItemWrapper implements CartItem {

    private CartItemStatus status = CartItemStatus.PENDING_INSPECTION;

    @Override
    public CartItemStatus getStatus() {
        return status;
    }

    @Override
    public void setStatus(CartItemStatus status) {
        this.status = status;
    }
}
