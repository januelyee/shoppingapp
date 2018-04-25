package com.januelyee.shoppingcart.domain.abstraction.inventory;

import com.januelyee.shoppingcart.domain.template.inventory.Product;
import com.januelyee.shoppingcart.domain.template.inventory.ProductAttribute;

import java.util.ArrayList;
import java.util.List;

public abstract class AbstractProduct implements Product {

    private String name;
    private String productNumber;
    private double price;
    private List<ProductAttribute> productAttributes;

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public void setPrice(double price) {
        this.price = price;
    }

    @Override
    public void setProductNumber(String number) {
        this.productNumber = number;
    }

    @Override
    public String getProductNumber() {
        return productNumber;
    }

    @Override
    public void setProductAttributes(List<ProductAttribute> productAttributes) {
        this.productAttributes = productAttributes;
    }

    @Override
    public void setAttribute(ProductAttribute attribute) {
        if (attribute != null) {
            if (productAttributes == null) {
                productAttributes = new ArrayList<>();
                productAttributes.add(attribute);
            } else {
                for (ProductAttribute productAttribute : productAttributes) {
                    if (productAttribute.getName() != null) {
                        if (productAttribute.getName().equals(attribute.getName())) {
                            int index = productAttributes.indexOf(productAttribute);
                            productAttributes.set(index, attribute);
                        }
                    }
                }
            }
        }
    }

    @Override
    public void removeAttribute(String attributeName) {
        if (productAttributes != null && attributeName != null) {
            ProductAttribute attributeToRemove = null;

            for (ProductAttribute productAttribute : productAttributes) {
                if (productAttribute.getName().equals(attributeName)) {
                    attributeToRemove = productAttribute;
                    break;
                }
            }

            if (attributeToRemove != null) {
                productAttributes.remove(attributeToRemove);
            }
        }
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public double getPrice() {
        return price;
    }

    @Override
    public List<ProductAttribute> getProductAttributes() {
        return productAttributes;
    }

    @Override
    public ProductAttribute getAttribute(String attributeName) {
        if (productAttributes != null && attributeName != null) {
            for (ProductAttribute productAttribute : productAttributes) {
                if (productAttribute.getName().equals(attributeName)) {
                    return productAttribute;
                }
            }
        }

        return null;
    }
}
