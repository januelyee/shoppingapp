package com.januelyee.shoppingcart.domain.abstraction.customer;

import com.januelyee.shoppingcart.domain.template.customer.InventoryItemWrapper;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;

public abstract class AbstractInventoryItemWrapper implements InventoryItemWrapper {

    private int quantity;
    private InventoryItem inventoryItem;

    @Override
    public int decreaseQuantity(int reductionQuantity) {
        quantity = quantity - reductionQuantity;
        if (quantity < 0) {
            quantity = 0;
        }
        return quantity;
    }

    @Override
    public int increaseQuantity(int additionalQuantity) {
        quantity = quantity + additionalQuantity;
        return quantity;
    }

    @Override
    public InventoryItem getInventoryItem() {
        return inventoryItem;
    }

    @Override
    public int getQuantity() {
        return quantity;
    }

    @Override
    public void setInventoryItem(InventoryItem item) {
        this.inventoryItem = item;
    }

    @Override
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
