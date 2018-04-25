package com.januelyee.shoppingcart.domain.abstraction.personnel;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.OrderItem;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;
import com.januelyee.shoppingcart.domain.template.customer.ProductOrderHistory;
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

        for (OrderItem orderItem : orderItems) {
            if (orderItem.getInventoryItem() != null) {
                int orderQty = orderItem.getQuantity();
                int inventoryQty = inventoryManager.checkItemQuantity(orderItem.getInventoryItem().getItemCode());
                if ((inventoryQty - orderQty) < 0) {
                    orderItem.getInventoryItem().setQuantity(inventoryQty);
                    if (!order.getStatus().equals(OrderStatus.PROBLEMATIC)) {
                        order.setStatus(OrderStatus.PROBLEMATIC);
                    }
                }
            }
        }

        return order;
    }

    @Override
    public OrderStatus finalizeOrder(Order order) {
        checkState();
        checkInput(order);
        List<OrderItem> orderItems = order.getOrderItems();
        InventoryManager inventoryManager = getInventoryManager();
        OrderDispatcher orderDispatcher = getOrderDispatcher();

        for (OrderItem orderItem : orderItems) {
            if (orderItem.getInventoryItem() != null) {
                int orderQty = orderItem.getQuantity();
                int inventoryQty = inventoryManager.checkItemQuantity(orderItem.getInventoryItem().getItemCode());
                if ((inventoryQty - orderQty) < 0) {
                    order.setStatus(OrderStatus.PROBLEMATIC);
                    return order.getStatus();
                }
            }
        }

        List<ProductOrderHistory> orderHistories = orderDispatcher.dispatchOrder(order);
        for (OrderItem orderItem : orderItems) {
            if (orderItem.getInventoryItem() != null) {
                int newQty = inventoryManager.decreaseItemQuantity(orderItem.getInventoryItem().getItemCode(), orderItem.getQuantity());
            }
        }

        order.setStatus(OrderStatus.APPROVED);
        return order.getStatus();
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
