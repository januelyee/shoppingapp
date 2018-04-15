package com.refineddata.security.daos.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/08/2016
 * @since 1.0
 */

@ApplicationException
public class SecurityEntityNotFoundException extends RuntimeException {

    private static final long serialVersionUID = -6958017518718252029L;

    public SecurityEntityNotFoundException(String msg) {
        super(msg);
    }


    public SecurityEntityNotFoundException() {
        super();
    }


    public SecurityEntityNotFoundException(String msg, Exception e) {
        super(msg, e);
    }
}
