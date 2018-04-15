package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.enums.AuthenticationType;

import java.util.List;


/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public interface CompanyUser {
    User getUser();
    void setUser(User user);
    Company getCompany();
    void setCompany(Company company);
    List<AuthenticationInformation> getAuthentications();
    void setAuthentications(List<AuthenticationInformation> authentications);
    void addAuthenticationInformation(AuthenticationInformation authenticationInformation);
    void removeAuthenticationInformation(AuthenticationInformation authenticationInformation);
    AuthenticationInformation getAuthenticationInformationByType(AuthenticationType authenticationType);
}
