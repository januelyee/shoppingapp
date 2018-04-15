package com.refineddata.security.daos.jpa.company;

import com.refineddata.security.daos.company.CompanyApplicationDAOLocal;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.entities.company.CompanyApplicationEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import javax.ejb.Stateless;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */

@Stateless
public class CompanyApplicationDAOImpl extends DAOImpl2<CompanyApplication> implements CompanyApplicationDAOLocal {

    @Override
    protected Long getSecurityEntityId(CompanyApplication t) {
        if (t instanceof CompanyApplicationEntity) {
            CompanyApplicationEntity entity = (CompanyApplicationEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(CompanyApplication t) {
        if (t instanceof CompanyApplicationEntity) {
            CompanyApplicationEntity entity = (CompanyApplicationEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(CompanyApplication t, RecordStatus recordStatus) {
        if (t instanceof CompanyApplicationEntity) {
            CompanyApplicationEntity entity = (CompanyApplicationEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return CompanyApplicationEntity.class;
    }
}
