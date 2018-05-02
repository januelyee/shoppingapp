package com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.services.ejb.implementations.personnel.InventoryManagerImpl;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.Random;

public class InventoryManagerImplTest {

    private InventoryManagerImpl inventoryManager = new InventoryManagerImpl();
    private InventoryStorage inventoryStorage = new InventoryStorageMock();

    @Before
    public void setUp() throws Exception {
        inventoryManager.setInventoryStorage(inventoryStorage);
    }

    @Test
    public void testAddItem() {
        Product product = new ProductMock();
        ((ProductMock) product).setId(1L);
        product.setName("Test Product");
        product.setPrice(10);
        ProductAttribute attribute = product.createProductAttributeInstance();
        attribute.setName("Description");
        attribute.setValue("bla bla bla bla");

        product.setAttribute(attribute);

        InventoryItem item = new InventoryItemMock();
        item.setQuantity(1);
        String itemCode = "" + new Random().nextLong();
        item.setItemCode(itemCode);
        item.setProduct(product);

        inventoryManager.addItem(item);
        InventoryItem found = inventoryManager.getItem(itemCode);
        Assert.assertNotNull(found);
    }

}
