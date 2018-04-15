package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.enums.AccessType;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
public class CompanyApplicationRoleImpl {

    private String name;
    private CompanyApplication companyApplication;
    private AccessType accessType;


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public CompanyApplication getCompanyApplication() {
        return companyApplication;
    }


    public void setCompanyApplication(CompanyApplication companyApplication) {
        this.companyApplication = companyApplication;
    }


    public AccessType getAccessType() {
        return accessType;
    }


    public void setAccessType(AccessType accessType) {
        this.accessType = accessType;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyApplicationRoleImpl that = (CompanyApplicationRoleImpl) obj;

        if (getName() != null ? !getName().equals(that.getName()) : that.getName() != null) {
            return false;
        }
        return !(getCompanyApplication() != null ? !getCompanyApplication().equals(that.getCompanyApplication()) : that.getCompanyApplication() != null);

    }


    @Override
    public int hashCode() {
        int result = getName() != null ? getName().hashCode() : 0;
        result = 31 * result + (getCompanyApplication() != null ? getCompanyApplication().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "CompanyApplicationRole{" +
            "name='" + name + '\'' +
            ", companyApplication=" + companyApplication +
            ", accessType=" + accessType +
            '}';
    }
}
