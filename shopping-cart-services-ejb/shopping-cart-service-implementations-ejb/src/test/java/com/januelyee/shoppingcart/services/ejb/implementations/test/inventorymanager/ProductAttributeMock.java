package com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager;

import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProductAttribute;
import com.januelyee.shoppingcart.services.ejb.implementations.test.MockEntity;

public class ProductAttributeMock extends AbstractProductAttribute implements ProductAttribute, MockEntity {

    private Long id;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }
}
