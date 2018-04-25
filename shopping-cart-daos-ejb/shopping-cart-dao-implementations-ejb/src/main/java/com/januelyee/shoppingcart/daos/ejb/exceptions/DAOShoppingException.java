package com.januelyee.shoppingcart.daos.ejb.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.ShoppingException;

import javax.ejb.ApplicationException;

@ApplicationException
public class DAOShoppingException extends ShoppingException {

    private static final long serialVersionUID = 5853223393390666300L;

    public DAOShoppingException(String msg) {
        super(msg);
    }


    public DAOShoppingException() {
        super();
    }


    public DAOShoppingException(String msg, Exception e) {
        super(msg, e);
    }
}
