package com.refineddata.security.service.specs.client;

import com.refineddata.security.domain.enums.AuthenticationType;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public interface LoginForm {
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
