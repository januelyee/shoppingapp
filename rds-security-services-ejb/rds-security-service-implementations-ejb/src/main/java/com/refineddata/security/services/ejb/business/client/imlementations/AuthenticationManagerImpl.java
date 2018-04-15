package com.refineddata.security.services.ejb.business.client.imlementations;

import com.refineddata.security.daos.company.CompanyDAOLocal;
import com.refineddata.security.daos.company.CompanyUserDAOLocal;
import com.refineddata.security.domain.abstraction.company.AuthenticationInformation;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.service.specs.client.LoginForm;
import com.refineddata.security.services.ejb.business.BusinessService;
import com.refineddata.security.services.ejb.business.client.interfaces.AuthenticationManager;
import com.refineddata.security.services.ejb.business.client.interfaces.LoginRequestInformer;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.Arrays;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */

@Stateless
public class AuthenticationManagerImpl implements AuthenticationManager, BusinessService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationManagerImpl.class);

    @EJB
    private CompanyUserDAOLocal companyUserDAOLocal;

    @EJB
    private LoginRequestInformer loginRequestInformer;

    @EJB
    private CompanyDAOLocal companyDAOLocal;


    @Override
    public boolean verifyLoginInformation(LoginForm form) {
        if (form != null) {
            boolean isUserRegistered = loginRequestInformer.isUserRegistered(form.getEmail());
            if (isUserRegistered) {
                boolean isAllowedToUseApplication = loginRequestInformer.isUserAllowedToUseApplication(form.getEmail(), form.getAppId());
                if (isAllowedToUseApplication) {
                    return true;
                }
            }

            return false;
        }

        return false;
    }


    @Override
    public boolean authenticateLoginInformation(LoginForm form) {
        Long companyId;
        if (form != null) {
            try {
                companyId = Long.valueOf(Long.parseLong(form.getCompanyIdentifier()));

            } catch (NumberFormatException e) {

                throw new InvalidSecurityServiceInputException("Company ID should be a non-decimal number!");
            }

            if (companyId == null) {
                throw new InvalidSecurityServiceInputException("Company identification information is not present in login information.");
            }

            Company company = companyDAOLocal.findById(companyId);
            CompanyUser companyUser = companyUserDAOLocal.findByCompanyAndEmail(company, form.getEmail());

            AuthenticationInformation authenticationInformation = companyUser.getAuthenticationInformationByType(form.getAuthenticationType());

            if (authenticationInformation == null) {
                log.warn("This type of authentication is not available for this user!");
                return false;
            }

            // This should change to a proper encryption method.
            byte[] password = form.getAuthenticationCode().getBytes();
            if (Arrays.equals(password, authenticationInformation.getAuthenticationCode())) {
                return true;
            }
        }

        return false;
    }
}
