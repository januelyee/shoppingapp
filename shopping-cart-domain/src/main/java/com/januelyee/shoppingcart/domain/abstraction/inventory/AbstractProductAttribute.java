package com.januelyee.shoppingcart.domain.abstraction.inventory;

import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;

public abstract class AbstractProductAttribute implements ProductAttribute {

    private String name;
    private String value;
    private int sequenceNumber;

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getValue() {
        return value;
    }

    @Override
    public int getSequenceNumber() {
        return sequenceNumber;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public void setSequenceNumber(int sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }
}
