package com.refineddata.security.service.specs.businessobjects;

/**
 * Interface for authentication which is done through a username and a password.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 4.1
 */
public interface UsernamePasswordAuthenticatable {
    String getUsername();
    String getPassword();
    void setUsername(String username);
    void setPassword(String password);
}
