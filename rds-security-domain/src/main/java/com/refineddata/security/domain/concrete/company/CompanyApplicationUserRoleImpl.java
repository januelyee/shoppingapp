package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplicationRole;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUserRole;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public class CompanyApplicationUserRoleImpl implements CompanyApplicationUserRole {

    private CompanyApplicationUser user;
    private CompanyApplicationRole role;


    @Override
    public CompanyApplicationUser getUser() {
        return user;
    }


    @Override
    public void setUser(CompanyApplicationUser user) {
        this.user = user;
    }


    @Override
    public CompanyApplicationRole getRole() {
        return role;
    }


    @Override
    public void setRole(CompanyApplicationRole role) {
        this.role = role;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyApplicationUserRoleImpl userRole = (CompanyApplicationUserRoleImpl) obj;

        if (getUser() != null ? !getUser().equals(userRole.getUser()) : userRole.getUser() != null) {
            return false;
        }
        return !(getRole() != null ? !getRole().equals(userRole.getRole()) : userRole.getRole() != null);

    }


    @Override
    public int hashCode() {
        int result = getUser() != null ? getUser().hashCode() : 0;
        result = 31 * result + (getRole() != null ? getRole().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "CompanyApplicationUserRole{" +
            "user=" + user +
            ", role=" + role +
            '}';
    }
}
