package com.januelyee.shoppingcart.rest.api.dto;

import com.januelyee.shoppingcart.rest.api.dto.output.ProductAttributeOutputDTO;

import java.util.List;

public abstract class ProductRestDTO {
    private String name;
    private String productNumber;
    private double price;

    public void setName(String name) {
        this.name = name;
    }

    public void setProductNumber(String number) {
        this.productNumber = number;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String getProductNumber() {
        return productNumber;
    }
}
