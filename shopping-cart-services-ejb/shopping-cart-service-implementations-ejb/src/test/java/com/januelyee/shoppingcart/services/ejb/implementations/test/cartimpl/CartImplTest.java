package com.januelyee.shoppingcart.services.ejb.implementations.test.cartimpl;

import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.CartImpl;
import com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager.InventoryItemMock;
import com.januelyee.shoppingcart.services.ejb.implementations.test.inventorymanager.ProductMock;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class CartImplTest {

    private CartImpl cart;

    @Test
    public void testDecreaseItemQuantity() {
        cart = new CartImpl();

        int initialQuantity = 2;
        int reductionAmount = 1;
        CartItem item = createCartItem();
        item.setQuantity(initialQuantity);

        cart.addItem(item);
        cart.decreaseItemQuantity(item.getInventoryItem().getItemCode(), reductionAmount);

        List<CartItem> items = cart.getCartItems();
        CartItem found = items.get(0);

        Assert.assertEquals(found.getQuantity(), initialQuantity - reductionAmount);
    }

    @Test
    public void testIncreaseItemQuantity() {
        cart = new CartImpl();

        int initialQuantity = 2;
        int additionalAmount = 1;
        CartItem item = createCartItem();
        item.setQuantity(initialQuantity);

        cart.addItem(item);
        cart.increaseItemQuantity(item.getInventoryItem().getItemCode(), additionalAmount);

        List<CartItem> items = cart.getCartItems();
        CartItem found = items.get(0);

        Assert.assertEquals(found.getQuantity(), initialQuantity + additionalAmount);
    }

    @Test
    public void testGetCartItems() {
        cart = new CartImpl();

        int numberOfItems = 2;
        CartItem item1 = createCartItem();
        CartItem item2 = createCartItem();

        cart.addItem(item1);
        cart.addItem(item2);

        List<CartItem> items = cart.getCartItems();
        Assert.assertEquals(items.size(), numberOfItems);

        cart.removeCartItem(item1.getInventoryItem().getItemCode());
        Assert.assertEquals(items.size(), numberOfItems - 1);
    }

    @Test
    public void testSetCartItems() {
        cart = new CartImpl();

        int numberOfItems = 2;
        CartItem item1 = createCartItem();
        CartItem item2 = createCartItem();
        List<CartItem> cartItems = new ArrayList<>();
        cartItems.add(item1);
        cartItems.add(item2);

        cart.setCartItems(cartItems);

        List<CartItem> found = cart.getCartItems();
        Assert.assertEquals(found.size(), numberOfItems);

        cart.removeCartItem(item1.getInventoryItem().getItemCode());
        Assert.assertEquals(found.size(), numberOfItems - 1);
    }

    @Test
    public void testAddCartItem() {
        cart = new CartImpl();

        int numberOfItems = 1;
        CartItem item1 = createCartItem();

        cart.addItem(item1);

        List<CartItem> items = cart.getCartItems();
        Assert.assertEquals(items.size(), numberOfItems);
    }

    @Test
    public void testRemoveCartItem() {
        cart = new CartImpl();

        int numberOfItems = 1;
        CartItem item1 = createCartItem();

        cart.addItem(item1);

        List<CartItem> found = cart.getCartItems();
        Assert.assertEquals(found.size(), numberOfItems);

        cart.removeCartItem(item1.getInventoryItem().getItemCode());
        List<CartItem> foundAgain = cart.getCartItems();
        Assert.assertEquals(foundAgain.size(), numberOfItems - 1);
    }

    private CartItem createCartItem() {
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

        CartItem cartItem = new CartItemMock();
        cartItem.setInventoryItem(item);
        cartItem.setQuantity(1);
        return cartItem;
    }
}
