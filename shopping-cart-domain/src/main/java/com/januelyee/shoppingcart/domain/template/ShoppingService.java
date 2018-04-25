package com.januelyee.shoppingcart.domain.template;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;
import com.januelyee.shoppingcart.domain.template.personnel.InventoryManager;
import com.januelyee.shoppingcart.domain.template.personnel.OrderManager;

/**
 * Represents the services and operations for shopping.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface ShoppingService {
    void addItemToCart(String itemCode, int quantity);
    Cart getCart();
    void setCart(Cart cart);
    void returnCart();
    int increaseCartItemQuantity(String itemCode, int additionalQuantity);
    int decreaseCartItemQuantity(String itemCode, int reductionQuantity);

    OrderStatus submitOrder();
    Cart getUpdatedCartInformation();

    void setInventoryManager(InventoryManager inventoryManager);
    InventoryManager getInventoryManager();

    void setOrderManager(OrderManager orderManager);
    OrderManager getOrderManager();
}
