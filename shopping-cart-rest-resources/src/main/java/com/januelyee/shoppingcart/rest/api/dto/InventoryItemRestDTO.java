package com.januelyee.shoppingcart.rest.api.dto;

public abstract class InventoryItemRestDTO {

    private int quantity;
    private String itemCode;


    public int getQuantity() {
        return quantity;
    }


    public String getItemCode() {
        return itemCode;
    }


    public void setQuantity(int qty) {
        this.quantity = qty;
    }


    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

}
