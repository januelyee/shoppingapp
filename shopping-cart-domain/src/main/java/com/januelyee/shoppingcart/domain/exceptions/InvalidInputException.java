package com.januelyee.shoppingcart.domain.exceptions;

public class InvalidInputException extends ShoppingException {
    private static final long serialVersionUID = -3760398121619919271L;

    public InvalidInputException(String msg) {
        super(msg);
    }

    public InvalidInputException() {
        super();
    }

    public InvalidInputException(String msg, Exception e) {
        super(msg, e);
    }
}
