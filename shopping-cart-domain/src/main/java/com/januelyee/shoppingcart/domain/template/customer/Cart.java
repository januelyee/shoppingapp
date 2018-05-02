package com.januelyee.shoppingcart.domain.template.customer;

import java.util.List;

/**
 * Contains cart items for ordering.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface Cart {
    int decreaseItemQuantity(String itemCode, int reductionQuantity);
    int increaseItemQuantity(String itemCode, int additionalQuantity);

    List<CartItem> getCartItems();
    List<CartItem> getCartItemsCopy();

    void setCartItems(List<CartItem> items);

    int addItem(CartItem item);
    void removeCartItem(String itemCode);
}
