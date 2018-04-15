package com.refineddata.security.rest.api.client.dataobjects;

import com.refineddata.security.domain.enums.AuthenticationType;
import com.refineddata.security.service.specs.client.LoginForm;


/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public final class SecurityRESTLoginForm implements SecurityLoginForm {

    private static final long serialVersionUID = -6732781522211899098L;
    private String companyIdentifier;
    private String appId;
    private String email;
    private String authenticationCode;
    private AuthenticationType authenticationType;


    public SecurityRESTLoginForm() {
    }


    public SecurityRESTLoginForm(LoginForm loginForm) {
        setAppId(loginForm.getAppId());
        setEmail(loginForm.getEmail());
        setCompanyIdentifier(loginForm.getCompanyIdentifier());
        setAuthenticationType(loginForm.getAuthenticationType());
        setAuthenticationCode(loginForm.getAuthenticationCode());
    }


    @Override
    public String getCompanyIdentifier() {
        return companyIdentifier;
    }


    @Override
    public void setCompanyIdentifier(String companyIdentifier) {
        this.companyIdentifier = companyIdentifier;
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


    @Override
    public String getAuthenticationCode() {
        return authenticationCode;
    }


    @Override
    public void setAuthenticationCode(String authenticationCode) {
        this.authenticationCode = authenticationCode;
    }


    @Override
    public AuthenticationType getAuthenticationType() {
        return authenticationType;
    }


    @Override
    public void setAuthenticationType(AuthenticationType authenticationType) {
        this.authenticationType = authenticationType;
    }

}
