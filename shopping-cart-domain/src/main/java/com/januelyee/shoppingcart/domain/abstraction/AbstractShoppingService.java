package com.januelyee.shoppingcart.domain.abstraction;

import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;
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
        cart.addItem(cartItem);
    }

    @Override
    public void returnCart() {
        getCart().setCartItems(new ArrayList<CartItem>());
    }

    @Override
    public int increaseCartItemQuantity(String itemCode, int additionalQuantity) {
        checkState();
        return getCart().increaseItemQuantity(itemCode, additionalQuantity);
    }

    @Override
    public int decreaseCartItemQuantity(String itemCode, int reductionQuantity) {
        checkState();
        return getCart().decreaseItemQuantity(itemCode, reductionQuantity);
    }

    @Override
    public OrderStatus submitOrder() {
        checkState();

        if (getCart().getCartItems() == null || getCart().getCartItems().isEmpty()) {
            throw new InvalidInputException("Cart is empty!");
        }

        Order order = prepareOrder();
        return getOrderManager().finalizeOrder(order);
    }

    @Override
    public Cart getUpdatedCartInformation() {
        checkState();
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
                if (orderItem.getStatus().equals(OrderItemStatus.INSUFFICIENT_INVENTORY)) {
                    cartItem.setStatus(CartItemStatus.UNAVAILABLE);
                } else {
                    cartItem.setStatus(CartItemStatus.AVAILABLE);
                }

                cart.addItem(cartItem);
            }

            return cart;
        }

        return getCart();
    }


    @Override
    public List<InventoryItem> getInventoryItems() {
        checkState();
        return getInventoryManager().getItems();
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


    private void checkState() {
        if(getOrderManager() == null || getInventoryManager() == null || getCart() == null ) {
            throw new IllegalStateException("Shopping service dependencies are not initialized!");
        }
    }
}
