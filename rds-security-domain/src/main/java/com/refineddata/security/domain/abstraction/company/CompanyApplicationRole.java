package com.refineddata.security.domain.abstraction.company;

import com.refineddata.security.domain.enums.AccessType;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
public interface CompanyApplicationRole {
    String getName();
    void setName(String name);
    CompanyApplication getCompanyApplication();
    void setCompanyApplication(CompanyApplication companyApplication);
    AccessType getAccessType();
    void setAccessType(AccessType accessType);
}
