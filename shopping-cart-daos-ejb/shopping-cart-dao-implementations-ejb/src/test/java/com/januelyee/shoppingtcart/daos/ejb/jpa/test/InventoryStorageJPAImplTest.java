package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import com.januelyee.shoppingcart.daos.ejb.jpa.CRUDOperationsJPAImpl;
import com.januelyee.shoppingcart.daos.ejb.jpa.InventoryStorageJPAImpl;
import com.januelyee.shoppingcart.daos.ejb.jpa.ProductCatalogJPAImpl;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;
import com.januelyee.shoppingcart.entities.InventoryItemEntity;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

public class InventoryStorageJPAImplTest extends CRUDOperationsTest<InventoryItem> {

    private InventoryStorageJPAImpl dao = new InventoryStorageJPAImpl();
    private ProductCatalogJPAImpl productDAO = new ProductCatalogJPAImpl();

    @Override
    protected InventoryItem getEntityInstance() {
        InventoryItem item = ShoppingEntityFactory.getInventoryItemEntity();
        Product product = ShoppingEntityFactory.getProductEntity();
        productDAO.create(product);
        item.setProduct(product);

        return item;
    }

    @Override
    protected CRUDOperationsJPAImpl<InventoryItem> getEntityDAO() {
        return dao;
    }

    @Override
    protected Long getEntityId(InventoryItem inventoryItem) {
        if (inventoryItem instanceof InventoryItemEntity) {
            return ((InventoryItemEntity) inventoryItem).getId();
        }

        return null;
    }

    @Override
    protected void setEntityId(Long id, InventoryItem inventoryItem) {
        if (inventoryItem instanceof InventoryItemEntity) {
            ((InventoryItemEntity) inventoryItem).setId(id);
        } else {
            throw new ClassCastException("Given object is not a InventoryItem object!");
        }
    }

    @Override
    public void testUpdate() {

    }

    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
        productDAO.setEntityManager(entityManager);
    }


    @Test(expected = RecordNotFoundException.class)
    public void testInventoryRemovalWhenProductIsRemoved() {
        InventoryItem item = ShoppingEntityFactory.getInventoryItemEntity();
        Product product = ShoppingEntityFactory.getProductEntity();
        productDAO.create(product);
        item.setProduct(product);

        dao.create(item);
        InventoryItem found = dao.find(item);
        Assert.assertNotNull(found);

        List<Product> products = productDAO.findAll();
        productDAO.deleteAll(products);

        InventoryItem foundAgain = dao.find(item);
    }


    @After
    public void tearDown() {
        List<InventoryItem> entities = dao.findAll();
        dao.deleteAll(entities);

        List<Product> products = productDAO.findAll();
        productDAO.deleteAll(products);
    }

    /*@Test
    public void initTheData() {
        for (int x = 0; x < 10; x++) {

            Product product = ShoppingEntityFactory.getProductEntity();
            productDAO.create(product);
            item.setProduct(product);

            dao.create(item);
        }

    }

    @Test
    public void initItems() {
        List<Product> products = productDAO.findAll();
        for (Product product : products) {
            InventoryItem item = ShoppingEntityFactory.getInventoryItemEntity();
            item.setProduct(product);

            dao.create(item);
        }
    }*/
}
