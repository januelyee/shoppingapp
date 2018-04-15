package com.refineddata.security.daos.jpa.application;

import com.refineddata.security.daos.application.FeatureDAOLocal;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.entities.application.FeatureEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import javax.ejb.Stateless;

/**
 * Default JPA implementations for FeatureDAOLocal.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */

@Stateless
public class FeatureDAOImpl extends DAOImpl2<ApplicationModuleFeature> implements FeatureDAOLocal {

    @Override
    protected Long getSecurityEntityId(ApplicationModuleFeature t) {
        if (t instanceof FeatureEntity) {
            FeatureEntity entity = (FeatureEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(ApplicationModuleFeature t) {
        if (t instanceof FeatureEntity) {
            FeatureEntity entity = (FeatureEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(ApplicationModuleFeature t, RecordStatus recordStatus) {
        if (t instanceof FeatureEntity) {
            FeatureEntity entity = (FeatureEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return FeatureEntity.class;
    }
}
