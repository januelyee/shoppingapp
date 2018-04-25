package com.januelyee.shoppingcart.services.ejb.implementations.exceptions;

import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;

import javax.ejb.ApplicationException;

@ApplicationException
public class ServiceRecordNotFoundException extends RecordNotFoundException {
    private static final long serialVersionUID = -774439328066028326L;

    public ServiceRecordNotFoundException(String msg) {
        super(msg);
    }

    public ServiceRecordNotFoundException() {
        super();
    }

    public ServiceRecordNotFoundException(String msg, Exception e) {
        super(msg, e);
    }
}
