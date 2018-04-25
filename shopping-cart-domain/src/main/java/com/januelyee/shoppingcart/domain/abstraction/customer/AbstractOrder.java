package com.januelyee.shoppingcart.domain.abstraction.customer;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.OrderItem;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;
import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractOrder implements Order {

    private OrderStatus status;
    private List<OrderItem> orderItems;

    @Override
    public OrderStatus getStatus() {
        return status;
    }

    @Override
    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    @Override
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    @Override
    public void setOrderItems(List<OrderItem> items) {
        this.orderItems = items;
    }

    @Override
    public void addOrderItem(OrderItem item) {
        checkItem(item);

        if (orderItems == null) {
            orderItems = new ArrayList<>();
        }

        orderItems.add(item);
    }

    @Override
    public void removeItem(String itemCode) {
        if (orderItems != null) {
            OrderItem itemToRemove = null;
            for (OrderItem item : orderItems) {
                if (item.getInventoryItem() != null) {
                    if (item.getInventoryItem().getItemCode().equals(itemCode)) {
                        itemToRemove = item;
                        break;
                    }
                }
            }

            if (itemToRemove != null) {
                orderItems.remove(itemToRemove);
            }
        }
    }

    private void checkItem(OrderItem item) {
        if (item == null) {
            throw new InvalidInputException();
        }

        if (item.getInventoryItem() == null) {
            throw new InvalidInputException();
        }

        if (item.getInventoryItem().getProduct() == null) {
            throw new InvalidInputException();
        }

        if (item.getQuantity() <= 0) {
            throw new InvalidInputException();
        }
    }
}
