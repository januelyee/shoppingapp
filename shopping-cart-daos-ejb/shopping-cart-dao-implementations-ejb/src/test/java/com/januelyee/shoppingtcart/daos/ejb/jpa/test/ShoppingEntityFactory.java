package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import com.januelyee.shoppingcart.entities.InventoryItemEntity;
import com.januelyee.shoppingcart.entities.ProductAttributeEntity;
import com.januelyee.shoppingcart.entities.ProductEntity;

import java.math.BigDecimal;
import java.util.Random;

public class ShoppingEntityFactory {

    private static final Random random = new Random();

    public static ProductEntity getProductEntity() {
        ProductEntity p = new ProductEntity();
        p.setName("Test Product - " + random.nextInt());
        p.setProductNumber("PRODUCT-JUNIT-" + random.nextInt());
        p.setPrice(10);
        p.setAttribute(new ProductAttributeEntity("Manufacturer", "Bogus Corp"));
        p.setAttribute(new ProductAttributeEntity("Description", "The best bogus product out there!"));
        return p;
    }

    public static InventoryItemEntity getInventoryItemEntity() {
        InventoryItemEntity i = new InventoryItemEntity();
        i.setQuantity(10);
        i.setItemCode("ITEM-JUNIT-" + random.nextInt());
        return i;
    }
}
