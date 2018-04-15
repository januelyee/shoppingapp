package com.refineddata.security.dao.jpa.tests.company;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.concrete.company.CompanyApplicationImpl;
import com.refineddata.security.entities.application.ApplicationEntity;
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
public class CompanyDAOImplTest extends JPADAOTest2<Company> {

    private CompanyDAOImpl dao = new CompanyDAOImpl();
    private ApplicationDAOImpl applicationDAO = new ApplicationDAOImpl();

    @Override
    protected CompanyEntity getEntityInstance() {


        CompanyEntity companyEntity = SecurityEntityFactory.getCompanyEntityInstance();

        ApplicationEntity applicationEntity = SecurityEntityFactory.getApplicationEntityInstance();
        applicationDAO.add(applicationEntity);

        CompanyApplicationImpl companyApplication = SecurityEntityFactory.getCompanyApplicationEntityInstance();
        companyApplication.setCompany(companyEntity);
        companyApplication.setApplication(applicationEntity);

        companyEntity.addCompanyApplication(companyApplication);

        return companyEntity;
    }


    @Override
    protected SecurityDAOLocal<Company> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(Company t) {
        if (t instanceof CompanyEntity) {
            return ((CompanyEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(Company t) {
        if (t instanceof CompanyEntity) {
            return ((CompanyEntity) t).getUuid();
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
    }


    @After
    public void tearDown() {
        List<Company> entities = dao.findAll();
        dao.deleteAll(entities);

        List<Application> applications = applicationDAO.findAll();
        applicationDAO.deleteAll(applications);
    }
}
