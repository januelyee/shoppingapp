package com.refineddata.security.services.ejb.tests.application.daos;

import com.refineddata.security.daos.application.ApplicationDAOLocal;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import java.util.List;

/**
 * Mock DAO implementation for {@link ApplicationDAOLocal}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */
public class ApplicationDAOMockImpl extends MockDAOImpl<Application> implements ApplicationDAOLocal {

    @Override
    public Application findByAppId(String appId) {
        List<Application> applicationEntities = super.findAll();

        for (Application entity : applicationEntities) {
            if (entity.getAppId().equals(appId)) {
                return entity;
            }
        }

        throw new SecurityEntityNotFoundException();
    }


    @Override
    protected Long getSecurityEntityId(Application t) {
        if (t instanceof ApplicationEntity) {
            ApplicationEntity entity = (ApplicationEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(Application t) {
        if (t instanceof ApplicationEntity) {
            ApplicationEntity entity = (ApplicationEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(Application t, RecordStatus recordStatus) {
        if (t instanceof ApplicationEntity) {
            ApplicationEntity entity = (ApplicationEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected void setSecurityEntityId(Application t, Long id) {
        if (t instanceof ApplicationEntity) {
            ApplicationEntity entity = (ApplicationEntity) t;
            entity.setId(id);
        }
    }
}
