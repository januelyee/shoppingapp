package com.januelyee.shoppingcart.rest.api.dto;

public abstract class ProductAttributeRestDTO {

    private String name;
    private String value;
    private int sequenceNumber;

    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }

    public int getSequenceNumber() {
        return sequenceNumber;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public void setSequenceNumber(int sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }
}
