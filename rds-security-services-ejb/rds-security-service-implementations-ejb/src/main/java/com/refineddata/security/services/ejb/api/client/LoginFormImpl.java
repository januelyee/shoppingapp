package com.refineddata.security.services.ejb.api.client;

import com.refineddata.security.domain.enums.AuthenticationType;
import com.refineddata.security.service.specs.client.LoginForm;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public class LoginFormImpl implements LoginForm {

    private String companyIdentifier;
    private String appId;
    private String email;
    private String authenticationCode;
    private AuthenticationType authenticationType;


    public LoginFormImpl() {
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


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        LoginFormImpl loginForm = (LoginFormImpl) obj;

        if (getCompanyIdentifier() != null ? !getCompanyIdentifier().equals(loginForm.getCompanyIdentifier()) : loginForm.getCompanyIdentifier() != null) {
            return false;
        }
        if (getAppId() != null ? !getAppId().equals(loginForm.getAppId()) : loginForm.getAppId() != null) {
            return false;
        }
        if (getEmail() != null ? !getEmail().equals(loginForm.getEmail()) : loginForm.getEmail() != null) {
            return false;
        }
        return getAuthenticationType() == loginForm.getAuthenticationType();

    }


    @Override
    public int hashCode() {
        int result = getCompanyIdentifier() != null ? getCompanyIdentifier().hashCode() : 0;
        result = 31 * result + (getAppId() != null ? getAppId().hashCode() : 0);
        result = 31 * result + (getEmail() != null ? getEmail().hashCode() : 0);
        result = 31 * result + (getAuthenticationType() != null ? getAuthenticationType().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "LoginFormImpl{" +
            "companyIdentifier=" + companyIdentifier +
            ", appId='" + appId + '\'' +
            ", email='" + email + '\'' +
            '}';
    }
}
