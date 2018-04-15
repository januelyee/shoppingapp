package com.refineddata.security.services.exceptions;

import javax.ejb.ApplicationException;

/**
 * Thrown when an invalid service input is detected within service classes.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/13/2016
 * @since 1.0
 */

@ApplicationException
public class InvalidSecurityServiceInputException extends RuntimeException {

    private static final long serialVersionUID = 6606443824530348383L;

    public InvalidSecurityServiceInputException(String msg) {
        super(msg);
    }


    public InvalidSecurityServiceInputException() {
        super();
    }


    public InvalidSecurityServiceInputException(String msg, Exception e) {
        super(msg, e);
    }
}
