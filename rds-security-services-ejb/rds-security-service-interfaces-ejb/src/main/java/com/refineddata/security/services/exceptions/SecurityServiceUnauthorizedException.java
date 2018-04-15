package com.refineddata.security.services.exceptions;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/28/2016
 * @since 1.0
 */
public class SecurityServiceUnauthorizedException extends RuntimeException {

    private static final long serialVersionUID = 2911752549431256460L;


    public SecurityServiceUnauthorizedException(String msg) {
        super(msg);
    }


    public SecurityServiceUnauthorizedException() {
        super();
    }


    public SecurityServiceUnauthorizedException(String msg, Exception e) {
        super(msg, e);
    }
}
