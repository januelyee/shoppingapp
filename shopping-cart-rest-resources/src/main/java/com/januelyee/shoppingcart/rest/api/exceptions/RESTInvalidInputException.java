package com.januelyee.shoppingcart.rest.api.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;

import javax.ejb.ApplicationException;

@ApplicationException
public class RESTInvalidInputException extends InvalidInputException {

    public RESTInvalidInputException(String msg) {
        super(msg);
    }

    public RESTInvalidInputException() {
        super();
    }

    public RESTInvalidInputException(String msg, Exception e) {
        super(msg, e);
    }

}
