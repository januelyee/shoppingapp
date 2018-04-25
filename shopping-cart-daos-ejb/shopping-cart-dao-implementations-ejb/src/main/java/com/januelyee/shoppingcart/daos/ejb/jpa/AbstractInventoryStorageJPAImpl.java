package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.interfaces.InventoryStorageLocal;
import com.januelyee.shoppingcart.domain.template.StorageFactory;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;

public abstract class AbstractInventoryStorageJPAImpl extends CRUDOperationsJPAImpl<InventoryItem> implements InventoryStorageLocal {

    private StorageFactory<InventoryItem> storageFactory;

    @Override
    public StorageFactory<InventoryItem> getStorageFactory() {
        return storageFactory;
    }

    @Override
    public void setStorageFactory(StorageFactory<InventoryItem> storageFactory) {
        this.storageFactory = storageFactory;
    }

}
