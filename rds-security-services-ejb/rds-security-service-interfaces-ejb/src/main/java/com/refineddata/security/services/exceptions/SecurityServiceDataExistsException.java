package com.refineddata.security.services.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/16/2016
 * @since 1.0
 */

@ApplicationException
public class SecurityServiceDataExistsException extends RuntimeException {


    private static final long serialVersionUID = 6893429796931633338L;


    public SecurityServiceDataExistsException(String msg) {
        super(msg);
    }


    public SecurityServiceDataExistsException() {
        super();
    }


    public SecurityServiceDataExistsException(String msg, Exception e) {
        super(msg, e);
    }

}
