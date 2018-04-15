package com.refineddata.security.services.ejb.api.administration.main;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.services.administration.main.ApplicationInformationServiceLocal;
import com.refineddata.security.services.ejb.api.SecurityAPIRepresentative;
import com.refineddata.security.services.ejb.business.administration.main.interfaces.ApplicationInformationManager;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import java.util.Collection;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/13/2016
 * @since 1.0
 */

@Stateless
public class ApplicationInformationServiceImpl implements ApplicationInformationServiceLocal, SecurityAPIRepresentative {

    @EJB
    private ApplicationInformationManager applicationInformationManager;


    @Override
    public String getServiceName() {
        return ApplicationInformationServiceLocal.class.getCanonicalName();
    }


    @Override
    public String getServiceRepresentativeName() {
        return this.getClass().getCanonicalName();
    }


    @Override
    public void update(Application t) {
        applicationInformationManager.updateInformation(t);
    }


    @Override
    public Application find(Application t) {
        return applicationInformationManager.getLatestInformation(t.getAppId());
    }


    @Override
    public void delete(Application t) {
        applicationInformationManager.deleteInformation(t);
    }


    @Override
    public List<Application> findAll() {
        return applicationInformationManager.getAll();
    }


    @Override
    public void deleteAll(Collection<Application> objects) {
        applicationInformationManager.deleteAll(objects);
    }
}
