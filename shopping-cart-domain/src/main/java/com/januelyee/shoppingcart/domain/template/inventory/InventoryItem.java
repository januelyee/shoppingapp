package com.januelyee.shoppingcart.domain.template.inventory;

/**
 * Represents an item inside and inventory.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */
public interface InventoryItem {
    Product getProduct();
    int getQuantity();
    String getItemCode();

    void setProduct(Product product);
    void setQuantity(int qty);
    void setItemCode(String itemCode);

    int decreaseQuantity(int reductionQuantity);
    int increaseQuantity(int additionalQuantity);
}
