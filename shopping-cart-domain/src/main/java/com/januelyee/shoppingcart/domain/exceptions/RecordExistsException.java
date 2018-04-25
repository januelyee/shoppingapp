package com.januelyee.shoppingcart.domain.exceptions;

public class RecordExistsException extends ShoppingException {

    private static final long serialVersionUID = -9153003542425674050L;

    public RecordExistsException(String msg) {
        super(msg);
    }

    public RecordExistsException() {
        super();
    }

    public RecordExistsException(String msg, Exception e) {
        super(msg, e);
    }
}
