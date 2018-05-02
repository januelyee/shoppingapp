package com.januelyee.shoppingcart.domain.template.customer;

/**
 * Holds inventory items inside the cart.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface CartItem extends InventoryItemWrapper {
    CartItemStatus getStatus();
    void setStatus(CartItemStatus status);
}
