package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductCatalogLocal;
import com.januelyee.shoppingcart.domain.template.StorageFactory;
import com.januelyee.shoppingcart.domain.template.inventory.Product;

public abstract class AbstractProductCatalogJPAImpl extends CRUDOperationsJPAImpl<Product> implements ProductCatalogLocal {

    private StorageFactory<Product> storageFactory;

    @Override
    public StorageFactory<Product> getStorageFactory() {
        return storageFactory;
    }

    @Override
    public void setStorageFactory(StorageFactory<Product> storageFactory) {
        this.storageFactory = storageFactory;
    }
}
