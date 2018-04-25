package com.januelyee.shoppingcart.domain.exceptions;

public class RecordNotFoundException extends ShoppingException {

    private static final long serialVersionUID = -4532492805231419054L;

    public RecordNotFoundException(String msg) {
        super(msg);
    }

    public RecordNotFoundException() {
        super();
    }

    public RecordNotFoundException(String msg, Exception e) {
        super(msg, e);
    }
}
