package com.januelyee.shoppingcart.domain.abstraction.inventory;

import com.januelyee.shoppingcart.domain.template.StorageFactory;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductCatalog;
import com.januelyee.shoppingcart.domain.abstraction.AbstractCRUDOperations;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public abstract class AbstractProductCatalog extends AbstractCRUDOperations<Product> implements ProductCatalog {

    private StorageFactory<Product> storageFactory;

    @Override
    public List<Product> findByProductNumbers(Collection<String> productNumbers) {
        List<Product> found = new ArrayList<>();

        for (Product product : getRecs().values()) {
            if (product.getProductNumber() != null) {
                if (productNumbers.contains(product.getProductNumber())) {
                    found.add(product);
                }
            }
        }

        return found;
    }

    @Override
    public StorageFactory<Product> getStorageFactory() {
        return storageFactory;
    }

    @Override
    public void setStorageFactory(StorageFactory<Product> storageFactory) {
        this.storageFactory = storageFactory;
    }
}
