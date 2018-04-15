package com.refineddata.security.dao.jpa.tests.company;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyApplicationDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.entities.company.CompanyApplicationEntity;
import com.refineddata.security.entities.company.CompanyEntity;
import org.junit.After;
import org.junit.Before;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */
public class CompanyApplicationDAOImplTest extends JPADAOTest2<CompanyApplication> {

    private CompanyApplicationDAOImpl dao = new CompanyApplicationDAOImpl();
    private ApplicationDAOImpl applicationDAO = new ApplicationDAOImpl();
    private CompanyDAOImpl companyDAO = new CompanyDAOImpl();

    @Override
    protected CompanyApplicationEntity getEntityInstance() {
        CompanyEntity companyEntity = SecurityEntityFactory.getCompanyEntityInstance();
        companyDAO.add(companyEntity);

        ApplicationEntity applicationEntity = SecurityEntityFactory.getApplicationEntityInstance();
        applicationDAO.add(applicationEntity);

        CompanyApplicationEntity companyApplicationEntity = SecurityEntityFactory.getCompanyApplicationEntityInstance();
        companyApplicationEntity.setCompany(companyEntity);
        companyApplicationEntity.setApplication(applicationEntity);

        return companyApplicationEntity;
    }


    @Override
    protected SecurityDAOLocal<CompanyApplication> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(CompanyApplication t) {
        if (t instanceof CompanyApplicationEntity) {
            return ((CompanyApplicationEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(CompanyApplication t) {
        if (t instanceof CompanyApplicationEntity) {
            return ((CompanyApplicationEntity) t).getUuid();
        }

        return null;
    }


    @Override
    public void testUpdate() {

    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
        applicationDAO.setEntityManager(entityManager);
        companyDAO.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<CompanyApplication> entities = dao.findAll();
        dao.deleteAll(entities);

        List<Company> companies = companyDAO.findAll();
        companyDAO.deleteAll(companies);

        List<Application> applications = applicationDAO.findAll();
        applicationDAO.deleteAll(applications);
    }
}
