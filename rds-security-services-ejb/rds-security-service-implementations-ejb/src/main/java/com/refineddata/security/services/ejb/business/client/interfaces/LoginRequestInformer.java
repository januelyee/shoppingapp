package com.refineddata.security.services.ejb.business.client.interfaces;

import com.refineddata.security.domain.abstraction.company.Company;

import javax.ejb.Local;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */

@Local
public interface LoginRequestInformer {

    boolean isUserRegistered(String userEmail);
    List<Company> getListOfApplicationCompaniesForUser(String userEmail, String appId);

    boolean isUserAllowedToUseApplication(String userEmail, String appId);
}
