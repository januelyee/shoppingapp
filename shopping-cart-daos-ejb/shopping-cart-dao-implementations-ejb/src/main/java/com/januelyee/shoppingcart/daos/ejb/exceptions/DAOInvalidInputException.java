package com.januelyee.shoppingcart.daos.ejb.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.InvalidInputException;

import javax.ejb.ApplicationException;

@ApplicationException
public class DAOInvalidInputException extends InvalidInputException {

    private static final long serialVersionUID = 6291586196693138488L;

    public DAOInvalidInputException(String msg) {
        super(msg);
    }

    public DAOInvalidInputException() {
        super();
    }

    public DAOInvalidInputException(String msg, Exception e) {
        super(msg, e);
    }
}
