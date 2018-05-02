package com.januelyee.shoppingcart.rest.api.dto.output;

import com.januelyee.shoppingcart.rest.api.dto.CartItemRestDTO;

public class CartItemRestOutputDTO extends CartItemRestDTO {
    private InventoryItemRestOutputDTO inventoryItem;

    public InventoryItemRestOutputDTO getInventoryItem() {
        return inventoryItem;
    }

    public void setInventoryItem(InventoryItemRestOutputDTO item) {
        this.inventoryItem = item;
    }
}
