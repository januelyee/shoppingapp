package com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager;

import com.januelyee.shoppingcart.domain.template.Storable;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProduct;
import com.januelyee.shoppingcart.services.ejb.implementations.test.MockEntity;

public class ProductMock extends AbstractProduct implements Product, MockEntity {

    private Long id;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public ProductAttribute createProductAttributeInstance() {
        return new ProductAttributeMock();
    }
}
