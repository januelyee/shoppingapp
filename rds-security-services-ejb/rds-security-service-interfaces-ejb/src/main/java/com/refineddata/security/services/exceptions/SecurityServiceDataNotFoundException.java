package com.refineddata.security.services.exceptions;

import javax.ejb.ApplicationException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/16/2016
 * @since 1.0
 */

@ApplicationException
public class SecurityServiceDataNotFoundException extends RuntimeException {

    private static final long serialVersionUID = -7682027479347409681L;


    public SecurityServiceDataNotFoundException(String msg) {
        super(msg);
    }


    public SecurityServiceDataNotFoundException() {
        super();
    }


    public SecurityServiceDataNotFoundException(String msg, Exception e) {
        super(msg, e);
    }

}
