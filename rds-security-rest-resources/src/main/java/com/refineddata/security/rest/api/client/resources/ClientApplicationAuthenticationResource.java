package com.refineddata.security.rest.api.client.resources;

import com.refineddata.security.rest.api.client.dataobjects.SecurityLoginForm;
import com.refineddata.security.rest.api.client.dataobjects.SecurityLoginRequest;
import com.refineddata.security.rest.api.client.dataobjects.UserAuthenticationFormContent;


/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public interface ClientApplicationAuthenticationResource<
    LoginForm extends SecurityLoginForm,
    LoginRequest extends SecurityLoginRequest,
    FormContentReturn extends UserAuthenticationFormContent> {


    FormContentReturn requestLogin(LoginRequest restLoginRequest);
    boolean requestLoginAuthentication(LoginForm restLoginForm);
}
