package com.refineddata.security.services.ejb.api.administration.main;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.service.specs.administration.main.AppRegistryRemovalResponse;
import com.refineddata.security.service.specs.administration.main.AppRegistryRequest;
import com.refineddata.security.service.specs.administration.main.AppRegistryResponse;
import com.refineddata.security.services.administration.main.ApplicationRegistryServiceLocal;
import com.refineddata.security.services.ejb.api.SecurityAPIRepresentative;
import com.refineddata.security.services.ejb.business.administration.main.interfaces.ApplicationInformationManager;
import com.refineddata.security.services.ejb.business.administration.main.interfaces.ApplicationRegistrar;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;

/**
 *
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */

@Stateless(name = "ApplicationRegistryServiceLocal")
public class ApplicationRegistryServiceImpl implements ApplicationRegistryServiceLocal, SecurityAPIRepresentative {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRegistryServiceImpl.class);

    @EJB
    private ApplicationRegistrar applicationRegistrar;

    @EJB
    private ApplicationInformationManager applicationInformationManager;


    @Override
    public String getServiceName() {
        return ApplicationRegistryServiceLocal.class.getCanonicalName();
    }


    @Override
    public String getServiceRepresentativeName() {
        return this.getClass().getCanonicalName();
    }


    @Override
    public AppRegistryResponse registerApplication(AppRegistryRequest registryRequest) {
        String responseMessage = null;
        String errorStringMessage = "SERVICE error in registering administration: ";

        if (registryRequest == null) {
            errorStringMessage = errorStringMessage + "the registration request is invalid or undefined.";
            log.error(errorStringMessage);
            throw new InvalidSecurityServiceInputException(errorStringMessage);
        }

        if (registryRequest.getAppId() == null || registryRequest.getApplicationName() == null) {
            errorStringMessage = errorStringMessage + "The registration request is missing some important " +
                "information to register an app.";
            log.error(errorStringMessage);
            throw new InvalidSecurityServiceInputException(errorStringMessage);
        }

        try {
            applicationRegistrar.registerApp(registryRequest.getApplicationName(), registryRequest.getAppId());

        } catch (Exception e) {
            errorStringMessage = errorStringMessage + "The registration request was rejected due to the " +
                "following reasons: " + e.getMessage();
            log.error(errorStringMessage);
            responseMessage = e.getMessage();

        }

        return new AppRegistryResponseImpl(registryRequest.getAppId(), registryRequest.getApplicationName(), responseMessage);

    }


    @Override
    public AppRegistryRemovalResponse removeAppRegistry(String appId) {
        String responseMessage = null;
        String errorStringMessage = "SERVICE error in registering administration: ";

        if (appId == null) {
            errorStringMessage = errorStringMessage + "the app ID is invalid or undefined.";
            log.error(errorStringMessage);
            throw new InvalidSecurityServiceInputException(errorStringMessage);
        }

        Application latestAppInfo = applicationInformationManager.getLatestInformation(appId);

        try {
            applicationRegistrar.unregisterApp(appId);
        } catch (Exception e) {
            errorStringMessage = errorStringMessage + "The registration cancellation request was rejected due to the " +
                "following reasons: " + e.getMessage();
            log.error(errorStringMessage);
            responseMessage = e.getMessage();

        }

        return new AppRegistryRemovalResponseImpl(latestAppInfo.getAppId(), latestAppInfo.getName(), responseMessage);
    }


    @Override
    public AppRegistryRequestImpl getRequestTemplate() {
        AppRegistryRequestImpl request = new AppRegistryRequestImpl();
        request.setApplicationName("New Application");
        request.setAppId("ID");

        return request;
    }
}
