package com.januelyee.shoppingcart.daos.ejb.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;

import javax.ejb.ApplicationException;

@ApplicationException
public class DAORecordNotFoundException extends RecordNotFoundException {

    private static final long serialVersionUID = -5773009309412178428L;

    public DAORecordNotFoundException(String msg) {
        super(msg);
    }


    public DAORecordNotFoundException() {
        super();
    }


    public DAORecordNotFoundException(String msg, Exception e) {
        super(msg, e);
    }
}
