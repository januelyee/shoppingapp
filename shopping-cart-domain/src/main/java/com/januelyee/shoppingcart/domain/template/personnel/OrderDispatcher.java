package com.januelyee.shoppingcart.domain.template.personnel;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.ProductOrderHistory;

import java.util.List;

public interface OrderDispatcher {
    List<ProductOrderHistory> dispatchOrder(Order order);
}
