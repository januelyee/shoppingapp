package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.enums.AccessType;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public interface CompanyApplicationUser {
    CompanyUser getUser();
    void setUser(CompanyUser user);
    CompanyApplication getApplication();
    void setApplication(CompanyApplication application);
    AccessType getAccessType();
    void setAccessType(AccessType accessType);
    List<CompanyApplicationUserRole> getRoles();
    void setRoles(List<CompanyApplicationUserRole> userRoles);
    void addRole(CompanyApplicationRole role);
    void removeRole(CompanyApplicationRole role);
}
