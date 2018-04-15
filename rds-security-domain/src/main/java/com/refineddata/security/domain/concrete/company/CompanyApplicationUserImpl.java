package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationRole;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUserRole;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.enums.AccessType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public class CompanyApplicationUserImpl implements CompanyApplicationUser {

    private CompanyUser user;
    private CompanyApplication application;
    private AccessType accessType;
    private List<CompanyApplicationUserRole> userRoles;


    @Override
    public CompanyUser getUser() {
        return user;
    }


    @Override
    public void setUser(CompanyUser user) {
        this.user = user;
    }


    @Override
    public CompanyApplication getApplication() {
        return application;
    }


    @Override
    public void setApplication(CompanyApplication application) {
        this.application = application;
    }


    @Override
    public AccessType getAccessType() {
        return accessType;
    }


    @Override
    public void setAccessType(AccessType accessType) {
        this.accessType = accessType;
    }


    @Override
    public List<CompanyApplicationUserRole> getRoles() {
        if (userRoles == null) {
            userRoles = new ArrayList<>();
        }
        return Collections.unmodifiableList(userRoles);
    }


    protected List<CompanyApplicationUserRole> getRolesListReference() {
        return getModifiableRolesList();
    }

    private List<CompanyApplicationUserRole> getModifiableRolesList() {
        return userRoles;
    }


    @Override
    public void setRoles(List<CompanyApplicationUserRole> userRoles) {
        if (userRoles != null) {
            for (CompanyApplicationUserRole userRole : userRoles) {
                userRole.setUser(this);
            }

            Set<CompanyApplicationUserRole> userRolesSet = new HashSet<>(userRoles);
            this.userRoles = new ArrayList<>(userRolesSet);
        }
    }


    @Override
    public void addRole(CompanyApplicationRole role) throws IllegalStateException {
        if (application == null) {
            String message = "Cannot add role to company user when company administration in relation to the company user is" +
                " not defined yet!";
            throw new IllegalStateException(message);
        }

        if (role.getCompanyApplication().equals(this.application)) {
            CompanyApplicationUserRole userRole = new CompanyApplicationUserRoleImpl();
            userRole.setRole(role);
            userRole.setUser(this);

            if (this.userRoles == null) {
                this.userRoles = new ArrayList<>();
            }

            if (!this.userRoles.contains(userRole)) {
                this.userRoles.add(userRole);
            }

        }

    }


    @Override
    public void removeRole(CompanyApplicationRole role) {
        if (this.userRoles != null) {
            CompanyApplicationUserRole userRoleToRemove = null;
            for (CompanyApplicationUserRole userRole : this.userRoles) {
                if (userRole.getRole().equals(role)) {
                    userRoleToRemove = userRole;
                    break;
                }
            }

            if (userRoleToRemove != null) {
                this.userRoles.remove(userRoleToRemove);
            }
        }

    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyApplicationUserImpl that = (CompanyApplicationUserImpl) obj;

        if (getUser() != null ? !getUser().equals(that.getUser()) : that.getUser() != null) {
            return false;
        }
        return !(getApplication() != null ? !getApplication().equals(that.getApplication()) : that.getApplication() != null);

    }


    @Override
    public int hashCode() {
        int result = getUser() != null ? getUser().hashCode() : 0;
        result = 31 * result + (getApplication() != null ? getApplication().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "CompanyApplicationUser{" +
            "accessType=" + accessType +
            ", administration=" + application +
            ", user=" + user +
            '}';
    }
}
