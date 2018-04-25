package com.januelyee.shoppingcart.services.ejb.implementations;

import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.OrderItem;
import com.januelyee.shoppingcart.domain.abstraction.AbstractShoppingService;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.CartItemDTO;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.OrderDTO;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.OrderItemDTO;
import com.januelyee.shoppingcart.services.ejb.interfaces.CartLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.InventoryManagerLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.OrderManagerLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.ShoppingServiceLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateful;

@Stateful
public class ShoppingServiceImpl extends AbstractShoppingService implements ShoppingServiceLocal {

    @EJB
    private CartLocal cartLocal;

    @EJB
    private InventoryManagerLocal inventoryManagerLocal;

    @EJB
    private OrderManagerLocal orderManagerLocal;

    public ShoppingServiceImpl() {
    }

    @PostConstruct
    private void injectSuperclassDependencies() {
        super.setCart(this.cartLocal);
        super.setInventoryManager(this.inventoryManagerLocal);
        super.setOrderManager(this.orderManagerLocal);
    }

    @Override
    protected CartItem createCartItemInstance() {
        return new CartItemDTO();
    }

    @Override
    protected Order createOrderInstance() {
        return new OrderDTO();
    }

    @Override
    protected OrderItem createOrderItemInstance() {
        return new OrderItemDTO();
    }
}
