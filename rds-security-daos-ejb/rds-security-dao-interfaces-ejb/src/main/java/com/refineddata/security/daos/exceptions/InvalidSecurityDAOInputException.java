package com.refineddata.security.daos.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/08/2016
 * @since 1.0
 */

@ApplicationException
public class InvalidSecurityDAOInputException extends RuntimeException {

    private static final long serialVersionUID = 5543308370361865848L;

    public InvalidSecurityDAOInputException(String msg) {
        super(msg);
    }


    public InvalidSecurityDAOInputException() {
        super();
    }


    public InvalidSecurityDAOInputException(String msg, Exception e) {
        super(msg, e);
    }
}
