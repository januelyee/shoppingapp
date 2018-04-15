package com.refineddata.security.rest.api.client.dataobjects;

import com.refineddata.security.service.specs.client.LoginRequest;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public final class SecurityRESTLoginRequest implements SecurityLoginRequest {

    private static final long serialVersionUID = 2234881617820182094L;
    private String appId;
    private String email;

    public SecurityRESTLoginRequest() {
    }


    public SecurityRESTLoginRequest(LoginRequest loginRequest) {
        setAppId(loginRequest.getAppId());
        setEmail(loginRequest.getEmail());
    }


    @Override
    public String getAppId() {
        return appId;
    }


    @Override
    public void setAppId(String appId) {
        this.appId = appId;
    }


    @Override
    public String getEmail() {
        return email;
    }


    @Override
    public void setEmail(String email) {
        this.email = email;
    }
}
