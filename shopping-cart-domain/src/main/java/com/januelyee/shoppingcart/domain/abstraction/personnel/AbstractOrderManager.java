package com.januelyee.shoppingcart.domain.abstraction.personnel;

import com.januelyee.shoppingcart.domain.template.customer.*;
import com.januelyee.shoppingcart.domain.template.personnel.InventoryManager;
import com.januelyee.shoppingcart.domain.template.personnel.OrderDispatcher;
import com.januelyee.shoppingcart.domain.template.personnel.OrderManager;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;
import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

public abstract class AbstractOrderManager implements OrderManager {

    private InventoryManager inventoryManager;
    private OrderDispatcher orderDispatcher;

    @Override
    public void setInventoryManager(InventoryManager inventoryManager) {
        this.inventoryManager = inventoryManager;
    }

    @Override
    public InventoryManager getInventoryManager() {
        return inventoryManager;
    }

    @Override
    public void setOrderDispatcher(OrderDispatcher dispatcher) {
        this.orderDispatcher = dispatcher;
    }

    @Override
    public OrderDispatcher getOrderDispatcher() {
        return orderDispatcher;
    }

    @Override
    public Order updateOrderInformationWithProblems(Order order) {
        checkInput(order);

        List<OrderItem> orderItems = order.getOrderItems();
        InventoryManager inventoryManager = getInventoryManager();

        boolean isProblematic = false;
        for (OrderItem orderItem : orderItems) {
            if (orderItem.getInventoryItem() != null) {
                int orderQty = orderItem.getQuantity();
                int inventoryQty = inventoryManager.checkItemQuantity(orderItem.getInventoryItem().getItemCode());
                if ((inventoryQty - orderQty) < 0) {
                    orderItem.setStatus(OrderItemStatus.INSUFFICIENT_INVENTORY);
                    isProblematic = true;
                } else {
                    orderItem.setStatus(OrderItemStatus.SUFFICIENT_INVENTORY);
                }
            }
        }

        if (isProblematic) {
            order.setStatus(OrderStatus.PROBLEMATIC);
        } else {
            order.setStatus(OrderStatus.APPROVED);
        }

        return order;
    }

    @Override
    public OrderStatus finalizeOrder(Order order) {
        checkState();
        checkInput(order);
        Order updatedOrderInformation = updateOrderInformationWithProblems(order);
        List<OrderItem> orderItems = updatedOrderInformation.getOrderItems();


        if (updatedOrderInformation.getStatus().equals(OrderStatus.PROBLEMATIC)) {
            return OrderStatus.PROBLEMATIC;
        }

        OrderDispatcher orderDispatcher = getOrderDispatcher();
        List<ProductOrderHistory> orderHistories = orderDispatcher.dispatchOrder(order);

        for (OrderItem orderItem : orderItems) {
            if (orderItem.getInventoryItem() != null) {
                int newQty = inventoryManager.decreaseItemQuantity(orderItem.getInventoryItem().getItemCode(), orderItem.getQuantity());
            }
        }

        order.setStatus(OrderStatus.APPROVED);
        return order.getStatus();
    }


    private void validateOrder(Order order) {

    }

    private void checkInput(Order order) {
        if (order == null || CollectionUtils.isEmpty(order.getOrderItems())) {
            throw new InvalidInputException("The order is not defined or there are no items in the order!");
        }
    }

    private void checkState() {
        if (getInventoryManager() == null || getOrderDispatcher() == null) {
            throw new IllegalStateException("OrderManager state is not setup properly!");
        }
    }
}
