package com.januelyee.shoppingcart.services.ejb.implementations.test.ordermanager;

import com.januelyee.shoppingcart.domain.abstraction.customer.AbstractCart;
import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.CartItem;

import java.util.List;

public class CartMock extends AbstractCart implements Cart {
    @Override
    public List<CartItem> getCartItemsCopy() {
        return null;
    }
}
