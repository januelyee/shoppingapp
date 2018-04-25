package com.januelyee.shoppingcart.rest.api.dto.output;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.abstraction.customer.AbstractCart;

import java.io.Serializable;

public class CartRestOutputDTO extends AbstractCart implements Cart, Serializable {
    private static final long serialVersionUID = -1051065814104841267L;

    public CartRestOutputDTO(Cart cart) {
        setCartItems(cart.getCartItems());
    }
}
