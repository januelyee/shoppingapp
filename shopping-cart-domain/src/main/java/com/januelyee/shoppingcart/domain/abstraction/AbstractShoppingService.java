package com.januelyee.shoppingcart.domain.abstraction;

import com.januelyee.shoppingcart.domain.template.ShoppingService;
import com.januelyee.shoppingcart.domain.template.customer.*;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.personnel.InventoryManager;
import com.januelyee.shoppingcart.domain.template.personnel.OrderManager;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractShoppingService implements ShoppingService {

    private OrderManager orderManager;
    private InventoryManager inventoryManager;
    private Cart cart;

    protected abstract CartItem createCartItemInstance();
    protected abstract Order createOrderInstance();
    protected abstract OrderItem createOrderItemInstance();

    @Override
    public Cart getCart() {
        return cart;
    }

    @Override
    public void setCart(Cart cart) {
        this.cart = cart;
    }

    @Override
    public void setInventoryManager(InventoryManager inventoryManager) {
        this.inventoryManager = inventoryManager;
    }

    @Override
    public InventoryManager getInventoryManager() {
        return inventoryManager;
    }

    @Override
    public void setOrderManager(OrderManager orderManager) {
        this.orderManager = orderManager;
    }

    @Override
    public OrderManager getOrderManager() {
        return orderManager;
    }

    @Override
    public void addItemToCart(String itemCode, int quantity) {
        InventoryItem item = getInventoryManager().getItem(itemCode);
        CartItem cartItem = createCartItemInstance();
        cartItem.setInventoryItem(item);
        cartItem.setQuantity(quantity);
        getCart().addItem(cartItem);
    }

    @Override
    public void returnCart() {
        getCart().setCartItems(new ArrayList<CartItem>());
    }

    @Override
    public int increaseCartItemQuantity(String itemCode, int additionalQuantity) {
        return getCart().increaseItemQuantity(itemCode, additionalQuantity);
    }

    @Override
    public int decreaseCartItemQuantity(String itemCode, int reductionQuantity) {
        return getCart().decreaseItemQuantity(itemCode, reductionQuantity);
    }

    @Override
    public OrderStatus submitOrder() {
        Order order = prepareOrder();
        return getOrderManager().finalizeOrder(order);
    }

    @Override
    public Cart getUpdatedCartInformation() {
        Order order = prepareOrder();
        Order updatedOrderInformation = getOrderManager().updateOrderInformationWithProblems(order);
        if (updatedOrderInformation.getStatus().equals(OrderStatus.PROBLEMATIC)) {
            Cart cart = getCart();
            cart.setCartItems(new ArrayList<CartItem>());
            List<OrderItem> orderItems = updatedOrderInformation.getOrderItems();
            for (OrderItem orderItem : orderItems) {
                CartItem cartItem = createCartItemInstance();
                cartItem.setQuantity(orderItem.getQuantity());
                cartItem.setInventoryItem(orderItem.getInventoryItem());
                cart.addItem(cartItem);
            }

            return cart;
        }

        return getCart();
    }


    private Order prepareOrder() {
        Order order = createOrderInstance();
        List<CartItem> cartItemList = getCart().getCartItems();
        for (CartItem cartItem : cartItemList) {
            OrderItem orderItem = createOrderItemInstance();
            orderItem.setInventoryItem(cartItem.getInventoryItem());
            orderItem.setQuantity(cartItem.getQuantity());
            order.addOrderItem(orderItem);
        }

        return order;
    }
}
