package com.refineddata.security.daos.jpa.application;

import com.refineddata.security.daos.application.ModuleDAOLocal;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.entities.application.ModuleEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import javax.ejb.Stateless;

/**
 * Default JPA implementations for ModuleDAOLocal.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */

@Stateless
public class ModuleDAOImpl extends DAOImpl2<ApplicationModule> implements ModuleDAOLocal {

    @Override
    protected Long getSecurityEntityId(ApplicationModule t) {
        if (t instanceof ModuleEntity) {
            ModuleEntity entity = (ModuleEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(ApplicationModule t) {
        if (t instanceof ModuleEntity) {
            ModuleEntity entity = (ModuleEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(ApplicationModule t, RecordStatus recordStatus) {
        if (t instanceof ModuleEntity) {
            ModuleEntity entity = (ModuleEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return ModuleEntity.class;
    }
}
