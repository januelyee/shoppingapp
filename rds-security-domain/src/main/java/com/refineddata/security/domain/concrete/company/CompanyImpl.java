package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents a company that owns registered applications.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/01/2016
 * @since 1.0
 */
public class CompanyImpl implements Company {

    private String name;
    private String logo;
    private List<CompanyApplication> companyApplications;


    @Override
    public String getName() {
        return name;
    }


    @Override
    public void setName(String name) {
        this.name = name;
    }


    @Override
    public String getLogo() {
        return logo;
    }


    @Override
    public void setLogo(String logo) {
        this.logo = logo;
    }


    @Override
    public List<CompanyApplication> getCompanyApplications() {
        if (companyApplications == null) {
            companyApplications = new ArrayList<>();
        }

        return Collections.unmodifiableList(companyApplications);
    }


    protected List<CompanyApplication> getCompanyApplicationsListReference() {
        return getModifiableCompanyApplicationsList();
    }


    private List<CompanyApplication> getModifiableCompanyApplicationsList() {
        if (companyApplications == null) {
            companyApplications = new ArrayList<>();
        }
        return companyApplications;
    }


    @Override
    public void setCompanyApplications(List<CompanyApplication> companyApplications) {
        if (companyApplications != null) {
            for (CompanyApplication companyApplication : companyApplications) {
                companyApplication.setCompany(this);
            }

            Set<CompanyApplication> companyApplicationSet = new HashSet<>(companyApplications);
            this.companyApplications = new ArrayList<>(companyApplicationSet);
        } else {
            this.companyApplications = null;
        }
    }


    @Override
    public void addCompanyApplication(CompanyApplication companyApplication) {
        if (companyApplication != null) {
            companyApplication.setCompany(this);

            if (this.companyApplications == null) {
                this.companyApplications = new ArrayList<>();
            }

            this.companyApplications.add(companyApplication);
        }
    }


    @Override
    public void removeCompanyApplication(CompanyApplication companyApplication) {
        if (companyApplication != null) {
            this.companyApplications.remove(companyApplication);
        }
    }


    @Override
    public boolean hasApplication(Application application) {
        if (this.companyApplications != null && application != null) {
            CompanyApplicationImpl companyApplication = new CompanyApplicationImpl();
            companyApplication.setCompany(this);
            companyApplication.setApplication(application);

            return this.companyApplications.contains(companyApplication);
        }

        return false;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        CompanyImpl company = (CompanyImpl) obj;

        return !(getName() != null ? !getName().equals(company.getName()) : company.getName() != null);

    }


    @Override
    public int hashCode() {
        return getName() != null ? getName().hashCode() : 0;
    }


    @Override
    public String toString() {
        return "Company{" +
            "name='" + name + '\'' +
            '}';
    }
}
