package com.januelyee.shoppingcart.domain.exceptions;

public class ShoppingException extends RuntimeException {

    private static final long serialVersionUID = 3746086007737347283L;

    public ShoppingException(String msg) {
        super(msg);
    }

    public ShoppingException() {
        super();
    }

    public ShoppingException(String msg, Exception e) {
        super(msg, e);
    }

}
