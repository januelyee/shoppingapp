package com.refineddata.security.services.ejb.business.client.interfaces;

import com.refineddata.security.service.specs.client.LoginForm;

import javax.ejb.Local;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */

@Local
public interface AuthenticationManager {
    boolean verifyLoginInformation(LoginForm form);
    boolean authenticateLoginInformation(LoginForm form);
}
