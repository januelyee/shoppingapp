package com.refineddata.security.rest.api.client.dataobjects;

import com.refineddata.security.domain.enums.AuthenticationType;

import java.io.Serializable;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/04/2016
 * @since 1.0
 */
public interface SecurityLoginForm extends Serializable {

    String getCompanyIdentifier();
    void setCompanyIdentifier(String companyIdentifier);
    String getAppId();
    void setAppId(String appId);
    String getEmail();
    void setEmail(String email);
    String getAuthenticationCode();
    void setAuthenticationCode(String authenticationCode);
    AuthenticationType getAuthenticationType();
    void setAuthenticationType(AuthenticationType authenticationType);

}
