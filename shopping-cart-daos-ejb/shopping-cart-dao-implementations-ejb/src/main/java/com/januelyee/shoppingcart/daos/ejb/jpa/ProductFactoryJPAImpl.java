package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductFactoryLocal;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.entities.ProductEntity;

import javax.ejb.Stateless;

@Stateless(mappedName = "ProductFactoryJPAImpl")
public class ProductFactoryJPAImpl implements ProductFactoryLocal {
    @Override
    public Product createInstance() {
        return new ProductEntity();
    }
}
