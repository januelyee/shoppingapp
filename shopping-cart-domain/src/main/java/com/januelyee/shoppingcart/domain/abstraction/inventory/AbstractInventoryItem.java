package com.januelyee.shoppingcart.domain.abstraction.inventory;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.template.inventory.Product;

public abstract class AbstractInventoryItem implements InventoryItem {

    private Product product;
    private int quantity;
    private String itemCode;

    @Override
    public int getQuantity() {
        return quantity;
    }

    @Override
    public String getItemCode() {
        return itemCode;
    }

    @Override
    public void setProduct(Product product) {
        this.product = product;
    }


    @Override
    public Product getProduct() {
        return product;
    }

    @Override
    public void setQuantity(int qty) {
        quantity = qty;
        if (quantity < 0) {
            quantity = 0;
        }

    }

    @Override
    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    @Override
    public int decreaseQuantity(int reductionQuantity) {
        int quantity = getQuantity();
        quantity = quantity - reductionQuantity;
        if (quantity < 0) {
            quantity = 0;
        }

        setQuantity(quantity);
        return quantity;
    }

    @Override
    public int increaseQuantity(int additionalQuantity) {
        int quantity = getQuantity();
        quantity = quantity + additionalQuantity;
        setQuantity(quantity);
        return quantity;
    }
}
