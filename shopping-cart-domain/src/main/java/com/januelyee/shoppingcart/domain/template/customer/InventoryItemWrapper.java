package com.januelyee.shoppingcart.domain.template.customer;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;

/**
 * A wrapper for anything that holds an inventory item.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface InventoryItemWrapper {

    int decreaseQuantity(int reductionQuantity);
    int increaseQuantity(int additionalQuantity);

    InventoryItem getInventoryItem();
    int getQuantity();

    void setInventoryItem(InventoryItem item);
    void setQuantity(int quantity);

}
