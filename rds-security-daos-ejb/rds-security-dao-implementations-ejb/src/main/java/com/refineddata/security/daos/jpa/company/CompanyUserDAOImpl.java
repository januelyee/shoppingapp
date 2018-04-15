package com.refineddata.security.daos.jpa.company;

import com.refineddata.security.daos.company.CompanyUserDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.entities.company.CompanyEntity;
import com.refineddata.security.entities.company.CompanyUserEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.persistence.NoResultException;
import javax.persistence.Query;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Stateless
public class CompanyUserDAOImpl extends DAOImpl2<CompanyUser> implements CompanyUserDAOLocal {

    private static final Logger log = LoggerFactory.getLogger(CompanyUserDAOImpl.class);

    @Override
    protected Long getSecurityEntityId(CompanyUser t) {
        if (t instanceof CompanyUserEntity) {
            CompanyUserEntity entity = (CompanyUserEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(CompanyUser t) {
        if (t instanceof CompanyUserEntity) {
            CompanyUserEntity entity = (CompanyUserEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }


    @Override
    protected void setSecurityEntityRecordStatus(CompanyUser t, RecordStatus recordStatus) {
        if (t instanceof CompanyUserEntity) {
            CompanyUserEntity entity = (CompanyUserEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }


    @Override
    protected Class getEntityClass() {
        return CompanyUserEntity.class;
    }


    @Override
    public CompanyUser findByCompanyAndEmail(Company company, String email) {
        String errorString = "DAO error in findByCompanyAndEmail(Company company, String email): ";

        if (company == null || email == null) {
            errorString = errorString + "both company and email are required, one or both of them is undefined!";
            log.error(errorString);
            throw new InvalidSecurityDAOInputException(errorString);
        }

        if (company instanceof CompanyEntity) {

            CompanyEntity companyEntity = (CompanyEntity) company;
            if (companyEntity.getId() != null) {
                try {
                    Query query = getEntityManager().createNamedQuery("CompanyUserEntity.findByCompanyAndEmail");
                    query.setParameter("companyId", companyEntity.getId());
                    query.setParameter("email", email);
                    return (CompanyUserEntity) query.getSingleResult();

                } catch (NoResultException nre) {
                    errorString = errorString + "CompanyUserEntity with company  :[" + company + "] and email [" + email + "] not found.";
                    log.error(errorString, nre);
                    throw new SecurityEntityNotFoundException(errorString);

                } catch (Exception e) {
                    errorString = errorString + "A system error has occurred searching for CompanyUserEntity with company  :[" + company + "] and email [" + email + "]";
                    log.error(errorString, e);
                    throw new SecurityDAOException(errorString, e);

                }

            } else {
                errorString = errorString + "company ID is not present!";
                throw new InvalidSecurityDAOInputException(errorString);

            }
        } else {
            errorString = errorString + SECURITY_ENTITY_CAST_ERROR_MESSAGE;
            throw new SecurityDAOException(errorString);
        }
    }
}
