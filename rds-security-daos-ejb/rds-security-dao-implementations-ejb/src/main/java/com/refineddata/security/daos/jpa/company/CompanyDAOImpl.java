package com.refineddata.security.daos.jpa.company;

import com.refineddata.security.daos.company.CompanyDAOLocal;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.entities.company.CompanyEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import javax.ejb.Stateless;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */

@Stateless
public class CompanyDAOImpl extends DAOImpl2<Company> implements CompanyDAOLocal {

    @Override
    protected Long getSecurityEntityId(Company t) {
        if (t instanceof CompanyEntity) {
            CompanyEntity entity = (CompanyEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(Company t) {
        if (t instanceof CompanyEntity) {
            CompanyEntity entity = (CompanyEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(Company t, RecordStatus recordStatus) {
        if (t instanceof CompanyEntity) {
            CompanyEntity entity = (CompanyEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return CompanyEntity.class;
    }
}
