package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import com.januelyee.shoppingcart.daos.ejb.jpa.CRUDOperationsJPAImpl;
import com.januelyee.shoppingcart.daos.ejb.jpa.ProductCatalogJPAImpl;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.entities.ProductEntity;
import org.junit.After;
import org.junit.Before;

import java.util.List;

public class ProductCatalogJPAImplTest extends CRUDOperationsTest<Product> {

    private ProductCatalogJPAImpl dao = new ProductCatalogJPAImpl();


    @Override
    protected Product getEntityInstance() {
        return ShoppingEntityFactory.getProductEntity();
    }

    @Override
    protected CRUDOperationsJPAImpl<Product> getEntityDAO() {
        return dao;
    }

    @Override
    protected Long getEntityId(Product product) {
        if (product instanceof ProductEntity) {
            return ((ProductEntity) product).getId();
        }

        return null;
    }

    @Override
    public void testUpdate() {

    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<Product> entities = dao.findAll();
        dao.deleteAll(entities);
    }
}
