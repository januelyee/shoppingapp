package com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager;

import com.januelyee.shoppingcart.domain.template.Storable;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProduct;

public class ProductMock extends AbstractProduct implements Product, Storable {

    @Override
    public Long getId() {
        return null;
    }

    @Override
    public void setId(Long id) {

    }

    @Override
    public ProductAttribute createProductAttributeInstance() {
        return null;
    }
}
