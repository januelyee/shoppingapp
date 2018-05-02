package com.januelyee.shoppingcart.services.ejb.implementations.test.ordermanager;

import com.januelyee.shoppingcart.domain.template.customer.*;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryStorage;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.domain.template.personnel.InventoryManager;
import com.januelyee.shoppingcart.domain.template.personnel.OrderDispatcher;
import com.januelyee.shoppingcart.services.ejb.implementations.personnel.OrderManagerImpl;
import com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager.InventoryItemMock;
import com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager.InventoryStorageMock;
import com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager.ProductMock;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class OrderManagerImplTest {

    private OrderManagerImpl orderManager = new OrderManagerImpl();
    private InventoryStorage inventoryStorage;

    @Before
    public void setUp() throws Exception {
        InventoryManager inventoryManager = new InventoryManagerMock();
        OrderDispatcher orderDispatcher = new OrderDispatcherMock();
        inventoryStorage = new InventoryStorageMock();

        inventoryManager.setInventoryStorage(inventoryStorage);

        orderManager.setInventoryManager(inventoryManager);
        orderManager.setOrderDispatcher(orderDispatcher);
    }

    @Test
    public void testUpdateOrderInformationWithProblems() {
        InventoryItem item = createInventoryItem();
        inventoryStorage.create(item);

        OrderItem orderItem = new OrderItemMock();
        orderItem.setInventoryItem(item);
        orderItem.setQuantity(2);
        Order orderWithProblems = new OrderMock();
        orderWithProblems.addOrderItem(orderItem);

        Order updatedOrder = orderManager.updateOrderInformationWithProblems(orderWithProblems);

        List<OrderItem> items = updatedOrder.getOrderItems();
        OrderItem updatedItem = items.get(0);

        Assert.assertEquals(updatedItem.getStatus().toString(), OrderItemStatus.INSUFFICIENT_INVENTORY.toString());
        Assert.assertEquals(orderWithProblems.getStatus().toString(), OrderStatus.PROBLEMATIC.toString());
    }

    @Test
    public void testFinalizeOrder() {
        InventoryItem item = createInventoryItem();
        inventoryStorage.create(item);

        OrderItem orderItem = new OrderItemMock();
        orderItem.setInventoryItem(item);
        orderItem.setQuantity(2);
        Order orderWithProblems = new OrderMock();
        orderWithProblems.addOrderItem(orderItem);

        Order updatedOrder = orderManager.updateOrderInformationWithProblems(orderWithProblems);

        List<OrderItem> items = updatedOrder.getOrderItems();
        OrderItem updatedItem = items.get(0);

        Assert.assertEquals(updatedItem.getStatus().toString(), OrderItemStatus.INSUFFICIENT_INVENTORY.toString());
        Assert.assertEquals(orderWithProblems.getStatus().toString(), OrderStatus.PROBLEMATIC.toString());

        OrderStatus firstTryStatus = orderManager.finalizeOrder(orderWithProblems);
        Assert.assertEquals(firstTryStatus.toString(), OrderStatus.PROBLEMATIC.toString());

        List<OrderItem> itemsToFix = updatedOrder.getOrderItems();
        OrderItem itemToFix = itemsToFix.get(0);
        itemToFix.setQuantity(1);
        List<OrderItem> fixedItems = new ArrayList<>();
        fixedItems.add(itemToFix);

        updatedOrder.setOrderItems(fixedItems);
        OrderStatus secondTryStatus = orderManager.finalizeOrder(updatedOrder);
        Assert.assertEquals(secondTryStatus.toString(), OrderStatus.APPROVED.toString());
    }

    private InventoryItem createInventoryItem() {
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

        return item;
    }

}
