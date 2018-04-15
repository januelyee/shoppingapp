package com.refineddata.security.services.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/16/2016
 * @since 1.0
 */

@ApplicationException
public class SecurityServiceException extends RuntimeException {

    private static final long serialVersionUID = -2934657710135206517L;


    public SecurityServiceException(String msg) {
        super(msg);
    }


    public SecurityServiceException() {
        super();
    }


    public SecurityServiceException(String msg, Exception e) {
        super(msg, e);
    }

}
