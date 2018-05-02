package com.januelyee.shoppingcart.services.ejb.implementations.customer;

import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProduct;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;

public class ProductImpl extends AbstractProduct implements Product {
    @Override
    public ProductAttribute createProductAttributeInstance() {
        return new ProductAttributeImpl();
    }
}
