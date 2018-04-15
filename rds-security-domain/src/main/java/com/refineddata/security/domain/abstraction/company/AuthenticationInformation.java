package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.enums.AuthenticationType;

/**
 * AuthenticationInformation contains information the type of authentication and the
 * authentication key/code that needs to be authenticated.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/30/2016
 * @since 1.0
 */
public interface AuthenticationInformation {
    AuthenticationType getType();
    void setType(AuthenticationType type);
    byte[] getAuthenticationCode();
    void setAuthenticationCode(byte[] authenticationCode);
    CompanyUser getCompanyUser();
    void setCompanyUser(CompanyUser companyUser);
}
