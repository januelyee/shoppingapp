package com.januelyee.shoppingcart.rest.api.dto;

import com.januelyee.shoppingcart.domain.template.customer.CartItemStatus;

public abstract class CartItemRestDTO {

    private CartItemStatus status;

    private int quantity;

    public CartItemStatus getStatus() {
        return status;
    }

    public void setStatus(CartItemStatus status) {
        this.status = status;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantity() {
        return quantity;
    }

}
