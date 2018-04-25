package com.januelyee.shoppingcart.daos.ejb.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.RecordExistsException;

import javax.ejb.ApplicationException;

@ApplicationException
public class DAORecordExistsException extends RecordExistsException {

    private static final long serialVersionUID = -1029609151126454843L;

    public DAORecordExistsException(String msg) {
        super(msg);
    }


    public DAORecordExistsException() {
        super();
    }


    public DAORecordExistsException(String msg, Exception e) {
        super(msg, e);
    }
}
