package com.januelyee.shoppingcart.domain.template.personnel;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;

import java.util.List;

public interface InventoryManager {

    void setInventoryStorage(InventoryStorage storage);
    InventoryStorage getInventoryStorage();

    int addItem(InventoryItem item);
    int increaseItemQuantity(String itemCode, int additionalQuantity);
    int decreaseItemQuantity(String itemCode, int reductionQuantity);

    int checkItemQuantity(String itemCode);
    InventoryItem getItem(String itemCode);

    List<InventoryItem> getItems();
    void removeItem(String itemCode);
    void updateItem(InventoryItem item);

}
