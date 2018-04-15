package com.refineddata.security.services.ejb.business.client.imlementations;

import com.refineddata.security.daos.company.CompanyApplicationUserDAOLocal;
import com.refineddata.security.daos.company.CompanyUserDAOLocal;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.daos.user.UserDAOLocal;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.services.ejb.business.BusinessService;
import com.refineddata.security.services.ejb.business.client.interfaces.LoginRequestInformer;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/27/2016
 * @since 1.0
 */

@Stateless
public class LoginRequestInformerImpl implements LoginRequestInformer, BusinessService {

    private static final Logger log = LoggerFactory.getLogger(LoginRequestInformerImpl.class);

    @EJB
    private UserDAOLocal userDAOLocal;

    @EJB
    private CompanyUserDAOLocal companyUserDAOLocal;

    @EJB
    private CompanyApplicationUserDAOLocal companyApplicationUserDAOLocal;

    @Override
    public boolean isUserRegistered(String userEmail) {
        String errorString = "isUserRegistered(String userEmail) error: ";

        try {
            userDAOLocal.findByEmail(userEmail);
            return true;

        } catch (SecurityEntityNotFoundException e) {
            errorString = errorString + "user does not exist.";
            log.warn(errorString);
            return false;

        }
    }


    @Override
    public List<Company> getListOfApplicationCompaniesForUser(String userEmail, String appId) {
        List<CompanyApplicationUser> companyApplicationUsers = companyApplicationUserDAOLocal.findByUserEmailAndAppId(userEmail, appId);
        List<Company> companiesForUser = new ArrayList<>();
        for (CompanyApplicationUser companyApplicationUser : companyApplicationUsers) {
            CompanyApplication application = companyApplicationUser.getApplication();
            companiesForUser.add(application.getCompany());
        }

        return companiesForUser;
    }


    @Override
    public boolean isUserAllowedToUseApplication(String userEmail, String appId) {
        List<CompanyApplicationUser> companyApplicationUsers = companyApplicationUserDAOLocal.findByUserEmailAndAppId(userEmail, appId);
        return !CollectionUtils.isEmpty(companyApplicationUsers);
    }
}
