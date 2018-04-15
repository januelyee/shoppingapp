package com.refineddata.security.daos.jpa.company;

import com.refineddata.security.daos.company.CompanyApplicationUserDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.entities.company.CompanyApplicationUserEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.persistence.Query;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */
@Stateless
public class CompanyApplicationUserDAOImpl extends DAOImpl2<CompanyApplicationUser> implements CompanyApplicationUserDAOLocal {

    private static final Logger log = LoggerFactory.getLogger(CompanyUserDAOImpl.class);

    @Override
    protected Long getSecurityEntityId(CompanyApplicationUser t) {
        if (t instanceof CompanyApplicationUserEntity) {
            CompanyApplicationUserEntity entity = (CompanyApplicationUserEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(CompanyApplicationUser t) {
        if (t instanceof CompanyApplicationUserEntity) {
            CompanyApplicationUserEntity entity = (CompanyApplicationUserEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(CompanyApplicationUser t, RecordStatus recordStatus) {
        if (t instanceof CompanyApplicationUserEntity) {
            CompanyApplicationUserEntity entity = (CompanyApplicationUserEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return CompanyApplicationUserEntity.class;
    }


    @Override
    public List<CompanyApplicationUser> findByUserEmailAndAppId(String userEmail, String appId) {
        String errorString = "DAO error in findByCompanyAndEmail(Company company, String email): ";

        if (appId == null || userEmail == null) {
            errorString = errorString + "both app ID and email are required, one or both of them is undefined!";
            log.error(errorString);
            throw new InvalidSecurityDAOInputException(errorString);
        }

        try {
            Query query = getEntityManager().createNamedQuery("CompanyApplicationUserEntity.findByUserEmailAndAppId");
            query.setParameter("appId", appId);
            query.setParameter("email", userEmail);
            List<CompanyApplicationUser> foundEntities = (List<CompanyApplicationUser>) query.getResultList();
            log.debug("CompanyApplicationUser entities found: " + foundEntities);
            return foundEntities;

        } catch (Exception e) {
            errorString = errorString + "A system error has occurred searching for CompanyApplicationUser entities for application " +
                "with app ID :[" + appId + "] and user email [" + userEmail + "]";
            log.error(errorString, e);
            throw new SecurityDAOException(errorString, e);
        }
    }
}
