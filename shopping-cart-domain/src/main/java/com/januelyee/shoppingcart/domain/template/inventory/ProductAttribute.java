package com.januelyee.shoppingcart.domain.template.inventory;

/**
 * Represents attributes of a product.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface ProductAttribute {
    String getName();
    String getValue();
    int getSequenceNumber();

    void setName(String name);
    void setValue(String value);
    void setSequenceNumber(int sequenceNumber);
}
