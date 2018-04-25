package com.januelyee.shoppingcart.domain.exceptions;

public class ShoppingConstraintException extends ShoppingException {

    private static final long serialVersionUID = 9045474542864117405L;

    public ShoppingConstraintException(String msg) {
        super(msg);
    }

    public ShoppingConstraintException() {
        super();
    }

    public ShoppingConstraintException(String msg, Exception e) {
        super(msg, e);
    }
}
