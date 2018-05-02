package com.januelyee.shoppingcart.rest.api.dto.output;

import java.util.List;

public class CartRestOutputDTO {

    private List<CartItemRestOutputDTO> cartItems;

    public List<CartItemRestOutputDTO> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItemRestOutputDTO> items) {
        this.cartItems = items;
    }
}
