package com.refineddata.security.services.ejb.api.client;

import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.service.specs.client.LoginRequest;
import com.refineddata.security.services.client.LoginAssistanceServiceLocal;
import com.refineddata.security.services.ejb.api.SecurityAPIRepresentative;
import com.refineddata.security.services.ejb.business.client.interfaces.LoginRequestInformer;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */

@Stateless
public class LoginAssistanceServiceImpl implements LoginAssistanceServiceLocal, SecurityAPIRepresentative {

    private static final Logger log = LoggerFactory.getLogger(LoginAssistanceServiceImpl.class);

    @EJB
    private LoginRequestInformer loginRequestInformer;

    @Override
    public List<Company> getListOfCompaniesForUserApplication(LoginRequest request) {
        String errorString = "SERVICE error in attaining the list of companies available for user: ";

        if (request == null) {
            errorString = errorString + "request object is undefined!";
            log.error(errorString);
            throw new InvalidSecurityServiceInputException(errorString);
        }

        if (request.getEmail() == null) {
            errorString = errorString + "email is undefined!";
            log.error(errorString);
            throw new InvalidSecurityServiceInputException(errorString);
        }

        if (request.getAppId() == null) {
            errorString = errorString + "app ID is undefined!";
            log.error(errorString);
            throw new InvalidSecurityServiceInputException(errorString);
        }

        return loginRequestInformer.getListOfApplicationCompaniesForUser(request.getEmail(), request.getAppId());
    }


    @Override
    public String getServiceName() {
        return LoginAssistanceServiceLocal.class.getCanonicalName();
    }


    @Override
    public String getServiceRepresentativeName() {
        return this.getClass().getCanonicalName();
    }
}
