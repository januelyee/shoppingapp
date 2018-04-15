package com.refineddata.security.service.specs.businessobjects;

/**
 * Standard and basic implementations for an authentication information.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
public class StandardAuthInformation implements UsernamePasswordAuthenticatable {

    private String username;
    private String password;

    @Override
    public String getUsername() {
        return username;
    }


    @Override
    public String getPassword() {
        return password;
    }


    @Override
    public void setUsername(String username) {
        this.username = username;
    }


    @Override
    public void setPassword(String password) {
        this.password = password;
    }
}
