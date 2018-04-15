package com.refineddata.security.services.ejb.business.administration.main.implementations;

import com.refineddata.security.daos.application.ApplicationDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOConstraintException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.services.ejb.business.BusinessService;
import com.refineddata.security.services.ejb.business.administration.main.interfaces.ApplicationInformationManager;
import com.refineddata.security.services.ejb.businessobjects.administration.main.ApplicationInformation;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import com.refineddata.security.services.exceptions.SecurityServiceDataNotFoundException;
import com.refineddata.security.services.exceptions.SecurityServiceConstraintException;
import com.refineddata.security.services.exceptions.SecurityServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Default EJB implementations for {@link ApplicationInformationManager}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/13/2016
 * @since 1.0
 */

@Stateless
public class ApplicationInformationManagerImpl implements ApplicationInformationManager, BusinessService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationInformationManagerImpl.class);
    private static final String DAO_ERROR_ENCOUNTERED_MSG = "A database access error was encountered while SERVICE is trying to " +
        "access data.";

    @EJB
    private ApplicationDAOLocal applicationDAOLocal;


    @Override
    public List<String> getModuleNames(Application appInfo) {
        Application found = applicationDAOLocal.find(appInfo);

        List<String> moduleNames = new ArrayList<>();
        for (ApplicationModule module : found.getModules()) {
            moduleNames.add(module.getName());
        }

        return moduleNames;
    }


    @Override
    public ApplicationInformation getInformationTemplate() {
        return new ApplicationInformation();
    }


    @Override
    public void updateInformation(Application infoObject) {
        if (infoObject instanceof ApplicationEntity) {
            ApplicationEntity applicationEntity = (ApplicationEntity) infoObject;
            Application existingEntity = applicationDAOLocal.findById(applicationEntity.getId());
            infoObject.setModules(existingEntity.getModules());

            try {
                applicationDAOLocal.update(infoObject);

            } catch (InvalidSecurityDAOInputException e) {
                throw new InvalidSecurityServiceInputException(DAO_ERROR_ENCOUNTERED_MSG, e);

            } catch (SecurityDAOException e) {
                throw new SecurityServiceException(DAO_ERROR_ENCOUNTERED_MSG, e);
            }
        } else {
            throw new InvalidSecurityServiceInputException(DAO_ERROR_ENCOUNTERED_MSG);
        }

    }


    @Override
    public void deleteInformation(Application infoObject) {
        try {
            applicationDAOLocal.delete(infoObject);

        } catch (InvalidSecurityDAOInputException e) {
            throw new InvalidSecurityServiceInputException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityDAOConstraintException e) {
            throw new SecurityServiceConstraintException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityDAOException e) {
            throw new SecurityServiceException(DAO_ERROR_ENCOUNTERED_MSG, e);
        }
    }


    @Override
    public ApplicationInformation getLatestInformation(String appId) {
        try {
            return (ApplicationInformation) applicationDAOLocal.findByAppId(appId);

        } catch (InvalidSecurityDAOInputException e) {
            throw new InvalidSecurityServiceInputException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityEntityNotFoundException e) {
            throw new SecurityServiceDataNotFoundException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityDAOException e) {
            throw new SecurityServiceException(DAO_ERROR_ENCOUNTERED_MSG, e);
        }
    }


    @Override
    public List<Application> getAll() {
        try {
            return applicationDAOLocal.findAll();

        } catch (SecurityDAOException e) {
            throw new SecurityServiceException(DAO_ERROR_ENCOUNTERED_MSG, e);
        }
    }


    @Override
    public void deleteAll(Collection<Application> infoObjects) {
        try {
            applicationDAOLocal.deleteAll(infoObjects);

        } catch (InvalidSecurityDAOInputException e) {
            throw new InvalidSecurityServiceInputException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityDAOConstraintException e) {
            throw new SecurityServiceConstraintException(DAO_ERROR_ENCOUNTERED_MSG, e);

        } catch (SecurityDAOException e) {
            throw new SecurityServiceException(DAO_ERROR_ENCOUNTERED_MSG, e);
        }
    }
}
