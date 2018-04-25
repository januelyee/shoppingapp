package com.januelyee.shoppingcart.domain.abstraction.inventory;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;
import com.januelyee.shoppingcart.domain.abstraction.AbstractCRUDOperations;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public abstract class AbstractInventoryStorage extends AbstractCRUDOperations<InventoryItem> implements InventoryStorage {

    @Override
    public List<InventoryItem> findByItemCodes(Collection<String> itemCodes) {
        List<InventoryItem> found = new ArrayList<>();

        for (InventoryItem item : getRecs().values()) {
            if (item.getItemCode() != null) {
                if (itemCodes.contains(item.getItemCode())) {
                    found.add(item);
                }
            }
        }

        return found;
    }
}
