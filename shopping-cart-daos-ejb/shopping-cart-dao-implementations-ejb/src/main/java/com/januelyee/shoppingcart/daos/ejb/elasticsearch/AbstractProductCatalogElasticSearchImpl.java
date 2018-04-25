package com.januelyee.shoppingcart.daos.ejb.elasticsearch;

import com.januelyee.shoppingcart.domain.template.StorageFactory;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductCatalog;

public abstract class AbstractProductCatalogElasticSearchImpl extends CRUDOperationsElasticSearchImpl<Product> implements ProductCatalog {

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
