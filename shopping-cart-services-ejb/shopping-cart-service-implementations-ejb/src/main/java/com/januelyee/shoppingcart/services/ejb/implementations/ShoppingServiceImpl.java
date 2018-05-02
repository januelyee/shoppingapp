package com.januelyee.shoppingcart.services.ejb.implementations;

import com.januelyee.shoppingcart.domain.template.customer.Cart;
import com.januelyee.shoppingcart.domain.template.customer.CartItem;
import com.januelyee.shoppingcart.domain.template.customer.Order;
import com.januelyee.shoppingcart.domain.template.customer.OrderItem;
import com.januelyee.shoppingcart.domain.abstraction.AbstractShoppingService;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.CartImpl;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.CartItemImpl;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.OrderDTO;
import com.januelyee.shoppingcart.services.ejb.implementations.customer.OrderItemDTO;
import com.januelyee.shoppingcart.services.ejb.interfaces.CartLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.InventoryManagerLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.OrderManagerLocal;
import com.januelyee.shoppingcart.services.ejb.interfaces.ShoppingServiceLocal;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Stateful;
import java.util.List;

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
    public Cart getCartCopy() {
        Cart cartCopy = new CartImpl();
        List<CartItem> itemsCopy = cartLocal.getCartItemsCopy();
        cartCopy.setCartItems(itemsCopy);


        return cartCopy;
    }

    @Override
    protected CartItem createCartItemInstance() {
        return new CartItemImpl();
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
