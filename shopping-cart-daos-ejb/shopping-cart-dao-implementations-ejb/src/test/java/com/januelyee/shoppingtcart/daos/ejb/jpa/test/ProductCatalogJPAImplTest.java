package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import com.januelyee.shoppingcart.daos.ejb.jpa.CRUDOperationsJPAImpl;
import com.januelyee.shoppingcart.daos.ejb.jpa.ProductCatalogJPAImpl;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.entities.ProductEntity;
import org.junit.After;
import org.junit.Assert;
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
    protected void setEntityId(Long id, Product product) {
        if (product instanceof ProductEntity) {
            ((ProductEntity) product).setId(id);
        } else {
            throw new ClassCastException("Given object is not a ProductEntity object!");
        }
    }

    @Override
    public void testUpdate() {
        String updatedName = "Modified Name";

        Product p = getEntityInstance();
        getEntityDAO().create(p);

        Product found = getEntityDAO().find(p);
        Assert.assertNotNull(found);

        Long foundId = getEntityId(found);
        setEntityId(foundId, p);

        p.setName(updatedName);

        getEntityDAO().update(p);

        Product foundAgain = getEntityDAO().find(p);
        Assert.assertEquals(updatedName, foundAgain.getName());

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
