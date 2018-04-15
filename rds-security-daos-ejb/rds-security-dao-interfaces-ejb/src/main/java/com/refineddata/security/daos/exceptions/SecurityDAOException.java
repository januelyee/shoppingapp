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
public class SecurityDAOException extends RuntimeException {

    private static final long serialVersionUID = -2706044744623009668L;

    public SecurityDAOException(String msg) {
        super(msg);
    }


    public SecurityDAOException() {
        super();
    }


    public SecurityDAOException(String msg, Exception e) {
        super(msg, e);
    }
}
