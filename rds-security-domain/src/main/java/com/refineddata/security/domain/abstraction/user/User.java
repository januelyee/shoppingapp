package com.refineddata.security.domain.abstraction.user;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
public interface User {
    String getFirstName();
    void setFirstName(String firstName);
    String getLastName();
    void setLastName(String lastName);
    String getEmail();
    void setEmail(String email);
    boolean isAuthenticatedExternally();
    void setIsAuthenticatedExternally(boolean isAuthenticatedExternally);
}
