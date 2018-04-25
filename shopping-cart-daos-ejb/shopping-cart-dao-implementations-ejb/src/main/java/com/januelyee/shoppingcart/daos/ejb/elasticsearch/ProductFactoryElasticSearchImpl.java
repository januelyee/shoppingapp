package com.januelyee.shoppingcart.daos.ejb.elasticsearch;

import com.januelyee.shoppingcart.daos.ejb.interfaces.ProductFactoryLocal;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.elasticsearch.objects.ProductObject;

import javax.ejb.Stateless;

@Stateless(mappedName = "ProductFactoryElasticSearchImpl")
public class ProductFactoryElasticSearchImpl implements ProductFactoryLocal {
    @Override
    public Product createInstance() {
        return new ProductObject();
    }
}
