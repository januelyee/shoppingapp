package com.januelyee.shoppingcart.rest.api.dto.output;

import com.januelyee.shoppingcart.rest.api.dto.ProductRestDTO;

import java.util.List;

public class ProductRestOutputDTO extends ProductRestDTO {

    private List<ProductAttributeOutputDTO> productAttributes;

    public List<ProductAttributeOutputDTO> getProductAttributes() {
        return productAttributes;
    }

    public void setProductAttributes(List<ProductAttributeOutputDTO> productAttributes) {
        this.productAttributes = productAttributes;
    }
}
