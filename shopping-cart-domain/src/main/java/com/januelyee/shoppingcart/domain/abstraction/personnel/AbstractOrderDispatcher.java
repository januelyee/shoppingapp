package com.januelyee.shoppingcart.domain.abstraction.personnel;

import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.ProductOrderHistory;
import com.januelyee.shoppingcart.domain.template.personnel.OrderDispatcher;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractOrderDispatcher implements OrderDispatcher {

    @Override
    public List<ProductOrderHistory> dispatchOrder(Order order) {
        return new ArrayList<>();
    }
}
