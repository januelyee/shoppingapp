package com.refineddata.security.daos.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/08/2016
 * @since 1.0
 */

@ApplicationException
public class SecurityEntityExistsException extends RuntimeException {

    private static final long serialVersionUID = -3521510253266868935L;

    public SecurityEntityExistsException(String msg) {
        super(msg);
    }


    public SecurityEntityExistsException() {
        super();
    }


    public SecurityEntityExistsException(String msg, Exception e) {
        super(msg, e);
    }
}
