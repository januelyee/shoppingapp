package com.januelyee.shoppingcart.services.ejb.implementations.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;

public class ServiceInvalidInputException extends InvalidInputException {

    public ServiceInvalidInputException(String msg) {
        super(msg);
    }

    public ServiceInvalidInputException() {
        super();
    }

    public ServiceInvalidInputException(String msg, Exception e) {
        super(msg, e);
    }
}
