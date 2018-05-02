package com.januelyee.shoppingcart.rest.api.dto.output;

import com.januelyee.shoppingcart.rest.api.dto.InventoryItemRestDTO;

public class InventoryItemRestOutputDTO extends InventoryItemRestDTO {

    private ProductRestOutputDTO product;

    public ProductRestOutputDTO getProduct() {
        return product;
    }

    public void setProduct(ProductRestOutputDTO product) {
        this.product = product;
    }
}
