package com.refineddata.security.daos.jpa.application;

import com.refineddata.security.daos.application.ApplicationDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.persistence.NoResultException;
import javax.persistence.Query;

/**
 * Default JPA implementations for ApplicationDAOLocal.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */

@Stateless
public class ApplicationDAOImpl extends DAOImpl2<Application> implements ApplicationDAOLocal {

    private static Logger log = LoggerFactory.getLogger(ApplicationDAOImpl.class);


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
    protected Class getEntityClass() {
        return ApplicationEntity.class;
    }


    @Override
    public Application findByAppId(String appId) {
        if(appId == null) {
            throw new InvalidSecurityDAOInputException("A system error has occurred while searching for BatchProcessLogs; null input value");
        }

        try {
            log.debug("DAO Searching for administration with appId [" + appId + "]");

            Query q = getEntityManager().createNamedQuery("ApplicationEntity.findByAppId");
            q.setParameter("appId", appId);

            ApplicationEntity entity = (ApplicationEntity) q.getSingleResult();

            log.trace("Found administration entity[" + entity + "]");

            return entity;
        } catch (NoResultException e) {
            String errorMsg = "A administration entity with appId [" + appId + "] was not found";
            log.warn(errorMsg);
            throw new SecurityEntityNotFoundException(errorMsg, e);
        } catch (Exception e) {
            String errorMsg = "An error has occurred in findByAppId!";
            log.error(errorMsg, e);
            throw new SecurityDAOException(errorMsg, e);
        }
    }
}
