package com.januelyee.shoppingcart.services.ejb.implementations.personnel;

import com.januelyee.shoppingcart.domain.abstraction.personnel.AbstractOrderManager;
import com.januelyee.shoppingcart.services.ejb.interfaces.InventoryManagerLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.OrderDispatcherLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.OrderManagerLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateless;

@Stateless
public class OrderManagerImpl extends AbstractOrderManager implements OrderManagerLocal {

    @EJB
    private InventoryManagerLocal inventoryManagerLocal;

    @EJB
    private OrderDispatcherLocal orderDispatcherLocal;

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setInventoryManager(inventoryManagerLocal);
        super.setOrderDispatcher(orderDispatcherLocal);
    }


}
