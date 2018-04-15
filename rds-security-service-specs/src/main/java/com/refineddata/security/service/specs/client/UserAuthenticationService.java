package com.refineddata.security.service.specs.client;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/21/2016
 * @since 1.0
 */
public interface UserAuthenticationService {
    LoginForm requestLogin(LoginRequest request);
    boolean authenticateUser(LoginForm form);
}
