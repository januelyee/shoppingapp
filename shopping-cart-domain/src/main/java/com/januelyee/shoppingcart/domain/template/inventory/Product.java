package com.januelyee.shoppingcart.domain.template.inventory;

import java.util.List;

/**
 * Represents a product.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface Product {

    void setName(String name);
    void setProductNumber(String number);
    void setPrice(double price);
    void setProductAttributes(List<ProductAttribute> productAttributes);
    void setAttribute(ProductAttribute attribute);
    void removeAttribute(String attributeName);

    String getName();
    double getPrice();
    String getProductNumber();
    List<ProductAttribute> getProductAttributes();
    ProductAttribute getAttribute(String attributeName);

    ProductAttribute createProductAttributeInstance();
}
