package com.januelyee.shoppingcart.domain.template.personnel;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.OrderStatus;

public interface OrderManager {
    void setInventoryManager(InventoryManager inventoryManager);
    InventoryManager getInventoryManager();

    void setOrderDispatcher(OrderDispatcher dispatcher);
    OrderDispatcher getOrderDispatcher();

    Order updateOrderInformationWithProblems(Order order);
    OrderStatus finalizeOrder(Order order);
}
