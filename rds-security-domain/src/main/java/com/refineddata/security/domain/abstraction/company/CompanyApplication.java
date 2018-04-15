package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.abstraction.application.Application;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
public interface CompanyApplication {
    public Application getApplication();
    public void setApplication(Application application);
    public Company getCompany();
    public void setCompany(Company company);
}
