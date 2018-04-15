package com.refineddata.security.services.ejb.business.administration.main.implementations;

import com.refineddata.security.daos.application.ApplicationDAOLocal;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.services.ejb.business.BusinessService;
import com.refineddata.security.services.ejb.business.administration.main.interfaces.ApplicationRegistrar;
import com.refineddata.security.services.ejb.businessobjects.administration.main.ApplicationInformation;
import com.refineddata.security.services.exceptions.SecurityServiceDataExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;

/**
 * Default EJB implementation for {@link ApplicationRegistrar}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */

@Stateless
public class ApplicationRegistrarImpl implements ApplicationRegistrar, BusinessService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRegistrarImpl.class);

    @EJB
    private ApplicationDAOLocal applicationDAOLocal;

    @Override
    public void registerApp(String name, String appId) {
        String methodName = "registerApp";

        try {
            applicationDAOLocal.findByAppId(appId);
            String errorString = methodName + " found an existing application with the same app ID.";
            log.warn(errorString);
            throw new SecurityServiceDataExistsException(errorString);

        } catch (SecurityEntityNotFoundException e) {
            log.debug(methodName + " registering new application.");
            ApplicationInformation application = new ApplicationInformation();
            applicationDAOLocal.add(application);
        }
    }


    @Override
    public void unregisterApp(String appId) {
        Application found = applicationDAOLocal.findByAppId(appId);
        found.setIsRegistered(false);
    }
}
