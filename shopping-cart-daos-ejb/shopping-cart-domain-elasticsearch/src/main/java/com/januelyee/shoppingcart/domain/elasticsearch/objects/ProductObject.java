package com.januelyee.shoppingcart.domain.elasticsearch.objects;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractProduct;

public class ProductObject extends AbstractProduct implements Product, ElasticSearchObject {

    private static final long serialVersionUID = 8347505489126473380L;
    private String id;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public ProductAttribute createProductAttributeInstance() {
        return new ProductAttributeObject();
    }
}
