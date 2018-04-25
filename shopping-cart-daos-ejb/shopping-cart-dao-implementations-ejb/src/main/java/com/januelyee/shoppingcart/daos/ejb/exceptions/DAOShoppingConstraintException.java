package com.januelyee.shoppingcart.daos.ejb.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.ShoppingConstraintException;

import javax.ejb.ApplicationException;

@ApplicationException
public class DAOShoppingConstraintException extends ShoppingConstraintException {
    private static final long serialVersionUID = -8612777347217003398L;

    public DAOShoppingConstraintException(String msg) {
        super(msg);
    }


    public DAOShoppingConstraintException() {
        super();
    }


    public DAOShoppingConstraintException(String msg, Exception e) {
        super(msg, e);
    }
}
