package com.januelyee.shoppingcart.domain.elasticsearch.objects;

import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.domain.abstraction.inventory.AbstractInventoryItem;

public class InventoryItemObject extends AbstractInventoryItem implements InventoryItem, ElasticSearchObject {

    private static final long serialVersionUID = 3321005115583990095L;
    private String id;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }
}
