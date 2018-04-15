package com.refineddata.security.services.ejb.api;

/**
 * Interface that qualifies to use business EJBs.  Any EJB/classes that wants to use a business EJB should
 * implement this interfaces.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */
public interface SecurityAPIRepresentative {

    /**
     * Returns the name of the service interfaces being represented.
     *
     * @return the name of the service interfaces being represented.
     */
    String getServiceName();

    /**
     * Returns the name of the representative of the service interfaces.
     *
     * @return the name of the representative.
     */
    String getServiceRepresentativeName();
}
