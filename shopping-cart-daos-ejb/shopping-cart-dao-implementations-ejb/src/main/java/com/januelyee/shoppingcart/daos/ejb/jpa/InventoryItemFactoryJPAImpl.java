package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.interfaces.InventoryItemFactoryLocal;
import com.januelyee.shoppingcart.domain.template.inventory.InventoryItem;
import com.januelyee.shoppingcart.entities.InventoryItemEntity;

import javax.ejb.Stateless;

@Stateless(mappedName = "InventoryItemFactoryJPAImpl")
public class InventoryItemFactoryJPAImpl implements InventoryItemFactoryLocal {
    @Override
    public InventoryItem createInstance() {
        return new InventoryItemEntity();
    }
}
