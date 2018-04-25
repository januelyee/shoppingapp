package com.januelyee.shoppingcart.domain.template.customer;

/**
 * Represents history of product order.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface ProductOrderHistory {
    String getCustomerCode();
    String getInventoryItemCode();
    String getProductName();
    double getProductPrice();
    int getOrderQuantity();
}
