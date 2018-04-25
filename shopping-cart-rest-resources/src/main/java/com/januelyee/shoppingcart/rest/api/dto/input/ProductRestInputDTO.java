package com.januelyee.shoppingcart.rest.api.dto.input;

import com.januelyee.shoppingcart.rest.api.dto.ProductRestDTO;

import java.util.List;

public class ProductRestInputDTO extends ProductRestDTO {
    private List<ProductAttributeRestInputDTO> productAttributes;

    public List<ProductAttributeRestInputDTO> getProductAttributes() {
        return productAttributes;
    }

    public void setProductAttributes(List<ProductAttributeRestInputDTO> productAttributes) {
        this.productAttributes = productAttributes;
    }
}
