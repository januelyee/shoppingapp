package com.januelyee.shoppingcart.services.ejb.implementations.personnel;

import com.januelyee.shoppingcart.daos.ejb.interfaces.InventoryStorageLocal;
import com.januelyee.shoppingcart.domain.abstraction.personnel.AbstractInventoryManager;
import com.januelyee.shoppingcart.services.ejb.interfaces.InventoryManagerLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;

@Stateless
public class InventoryManagerImpl extends AbstractInventoryManager implements InventoryManagerLocal {

    @EJB
    private InventoryStorageLocal inventoryStorageLocal;

    public InventoryManagerImpl() {
    }

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setInventoryStorage(inventoryStorageLocal);
    }
}
