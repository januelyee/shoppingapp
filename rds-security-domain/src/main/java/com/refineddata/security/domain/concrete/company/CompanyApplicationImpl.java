package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public class CompanyApplicationImpl implements CompanyApplication {

    private Application application;
    private Company company;


    @Override
    public Application getApplication() {
        return application;
    }


    @Override
    public void setApplication(Application application) {
        this.application = application;
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
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyApplicationImpl that = (CompanyApplicationImpl) obj;

        if (getApplication() != null ? !getApplication().equals(that.getApplication()) : that.getApplication() != null) {
            return false;
        }
        return !(getCompany() != null ? !getCompany().equals(that.getCompany()) : that.getCompany() != null);

    }


    @Override
    public int hashCode() {
        int result = getApplication() != null ? getApplication().hashCode() : 0;
        result = 31 * result + (getCompany() != null ? getCompany().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "CompanyApplication{" +
            "administration=" + application +
            ", company=" + company.getName() +
            '}';
    }
}
