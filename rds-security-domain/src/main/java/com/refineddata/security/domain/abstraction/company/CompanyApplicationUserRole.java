package com.refineddata.security.domain.abstraction.company;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public interface CompanyApplicationUserRole {
    CompanyApplicationUser getUser();
    void setUser(CompanyApplicationUser user);
    CompanyApplicationRole getRole();
    void setRole(CompanyApplicationRole role);
}
