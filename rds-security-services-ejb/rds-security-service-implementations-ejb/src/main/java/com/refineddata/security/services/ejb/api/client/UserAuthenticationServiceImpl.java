package com.refineddata.security.services.ejb.api.client;

import com.refineddata.security.service.specs.client.LoginForm;
import com.refineddata.security.service.specs.client.LoginRequest;
import com.refineddata.security.services.client.UserAuthenticationServiceLocal;
import com.refineddata.security.services.ejb.business.client.interfaces.AuthenticationManager;
import com.refineddata.security.services.ejb.business.client.interfaces.LoginRequestInformer;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;

import javax.ejb.EJB;
import javax.ejb.Stateless;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */

@Stateless
public class UserAuthenticationServiceImpl implements UserAuthenticationServiceLocal {

    @EJB
    private LoginRequestInformer loginRequestInformer;

    @EJB
    private AuthenticationManager authenticationManager;


    @Override
    public LoginForm requestLogin(LoginRequest request) {

        if (!loginRequestInformer.isUserRegistered(request.getEmail())) {
            throw new InvalidSecurityServiceInputException("The user with email " + request.getEmail() + " does not exist!");
        }

        if (!loginRequestInformer.isUserAllowedToUseApplication(request.getEmail(), request.getAppId())) {
            throw new InvalidSecurityServiceInputException("The user is not allowed to use application with app ID " + request.getAppId());
        }

        LoginForm form = new LoginFormImpl();
        form.setAppId(request.getAppId());
        form.setEmail(request.getEmail());
        form.setCompanyIdentifier("0");

        return form;
    }


    @Override
    public boolean authenticateUser(LoginForm form) {

        if (authenticationManager.verifyLoginInformation(form)) {
            return authenticationManager.authenticateLoginInformation(form);
        }

        throw new InvalidSecurityServiceInputException("The user login information cannot be verified.  Please check " +
            "if information is correct.");
    }
}
