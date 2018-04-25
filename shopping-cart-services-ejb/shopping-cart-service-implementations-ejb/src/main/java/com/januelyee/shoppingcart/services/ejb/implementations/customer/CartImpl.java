package com.januelyee.shoppingcart.services.ejb.implementations.customer;

import com.januelyee.shoppingcart.domain.abstraction.customer.AbstractCart;
import com.januelyee.shoppingcart.services.ejb.interfaces.CartLocal;

import javax.ejb.Stateful;

@Stateful
public class CartImpl extends AbstractCart implements CartLocal {
}
