package com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager;

import com.januelyee.shoppingcart.domain.template.StorageFactory;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractInventoryStorage;

public class InventoryStorageMock extends AbstractInventoryStorage implements InventoryStorage {
    @Override
    protected Long getRecordId(InventoryItem inventoryItem) {
        return null;
    }

    @Override
    protected void setRecordId(InventoryItem inventoryItem) {

    }

    @Override
    public StorageFactory<InventoryItem> getStorageFactory() {
        return null;
    }

    @Override
    public void setStorageFactory(StorageFactory<InventoryItem> storageFactory) {

    }
}
