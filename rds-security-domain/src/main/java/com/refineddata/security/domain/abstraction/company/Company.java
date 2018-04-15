package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.abstraction.application.Application;

import java.util.List;

/**
 * Represents a company that owns registered applications.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/01/2016
 * @since 1.0
 */
public interface Company {
    String getName();
    void setName(String name);
    String getLogo();
    void setLogo(String logo);
    List<CompanyApplication> getCompanyApplications();
    void setCompanyApplications(List<CompanyApplication> companyApplications);
    void addCompanyApplication(CompanyApplication companyApplication);
    void removeCompanyApplication(CompanyApplication companyApplication);
    boolean hasApplication(Application application);
}
