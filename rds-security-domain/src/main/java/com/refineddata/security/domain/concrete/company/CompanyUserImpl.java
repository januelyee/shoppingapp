package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.company.AuthenticationInformation;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.enums.AuthenticationType;

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
public class CompanyUserImpl implements CompanyUser {
    private User user;
    private Company company;
    private List<AuthenticationInformation> authentications;


    @Override
    public User getUser() {
        return user;
    }


    @Override
    public void setUser(User user) {
        this.user = user;
    }


    @Override
    public Company getCompany() {
        return company;
    }


    @Override
    public void setCompany(Company company) {
        this.company = company;
    }


    @Override
    public List<AuthenticationInformation> getAuthentications() {
        return Collections.unmodifiableList(authentications);
    }


    protected List<AuthenticationInformation> getAuthenticationsListReference() {
        return getModifiableAuthenticationsList();
    }

    private List<AuthenticationInformation> getModifiableAuthenticationsList() {
        return authentications;
    }


    @Override
    public void setAuthentications(List<AuthenticationInformation> authentications) {
        if (authentications != null) {
            for (AuthenticationInformation authenticationInformation : authentications) {
                authenticationInformation.setCompanyUser(this);
            }

            Set<AuthenticationInformation> authenticationInformationSet = new HashSet<>(authentications);
            this.authentications = new ArrayList<>(authenticationInformationSet);
        }
    }


    @Override
    public void addAuthenticationInformation(AuthenticationInformation authenticationInformation) {
        if (authenticationInformation != null) {
            authenticationInformation.setCompanyUser(this);

            if (this.authentications == null) {
                this.authentications = new ArrayList<>();
            }

            if (!this.authentications.contains(authenticationInformation)) {
                this.authentications.add(authenticationInformation);
            }
        }
    }


    @Override
    public void removeAuthenticationInformation(AuthenticationInformation authenticationInformation) {
        if (this.authentications != null && authenticationInformation != null) {
            this.authentications.remove(authenticationInformation);
        }
    }


    @Override
    public AuthenticationInformation getAuthenticationInformationByType(AuthenticationType authenticationType) {
        if (this.authentications != null && authenticationType != null) {
            for (AuthenticationInformation authenticationInformation : this.authentications) {
                if (authenticationInformation.getType().equals(authenticationType)) {
                    return authenticationInformation;
                }
            }
        }

        return null;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyUserImpl that = (CompanyUserImpl) obj;

        if (getUser() != null ? !getUser().equals(that.getUser()) : that.getUser() != null) {
            return false;
        }
        return !(getCompany() != null ? !getCompany().equals(that.getCompany()) : that.getCompany() != null);

    }


    @Override
    public int hashCode() {
        int result = getUser() != null ? getUser().hashCode() : 0;
        result = 31 * result + (getCompany() != null ? getCompany().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "CompanyUser{" +
            "company=" + company +
            ", user=" + user +
            '}';
    }
}
