package com.januelyee.shoppingcart.domain.template.inventory;

import com.januelyee.shoppingcart.domain.template.Storage;

import java.util.Collection;
import java.util.List;

/**
 * Represents a storage for inventory items.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface InventoryStorage extends Storage<InventoryItem> {
    List<InventoryItem> findByItemCodes(Collection<String> itemCodes);
}
