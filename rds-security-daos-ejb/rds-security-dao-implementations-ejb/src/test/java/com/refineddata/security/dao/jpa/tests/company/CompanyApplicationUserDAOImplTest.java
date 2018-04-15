package com.refineddata.security.dao.jpa.tests.company;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyApplicationDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyApplicationUserDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyUserDAOImpl;
import com.refineddata.security.daos.jpa.user.UserDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.concrete.application.SecurityApplication;
import com.refineddata.security.domain.concrete.company.CompanyImpl;
import com.refineddata.security.domain.concrete.company.CompanyApplicationImpl;
import com.refineddata.security.domain.concrete.company.CompanyApplicationUserImpl;
import com.refineddata.security.domain.concrete.company.CompanyUserImpl;
import com.refineddata.security.entities.company.CompanyApplicationUserEntity;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */
public class CompanyApplicationUserDAOImplTest extends JPADAOTest2<CompanyApplicationUser> {

    private CompanyApplicationUserDAOImpl dao = new CompanyApplicationUserDAOImpl();
    private CompanyUserDAOImpl companyUserDAO = new CompanyUserDAOImpl();
    private UserDAOImpl userDAO = new UserDAOImpl();
    private CompanyApplicationDAOImpl companyApplicationDAO = new CompanyApplicationDAOImpl();
    private ApplicationDAOImpl applicationDAO = new ApplicationDAOImpl();
    private CompanyDAOImpl companyDAO = new CompanyDAOImpl();


    @Before
    public void setup() {

        companyDAO.setEntityManager(entityManager);
        applicationDAO.setEntityManager(entityManager);
        userDAO.setEntityManager(entityManager);

        companyUserDAO.setEntityManager(entityManager);
        companyApplicationDAO.setEntityManager(entityManager);

        dao.setEntityManager(entityManager);
    }


    @Override
    protected CompanyApplicationUserImpl getEntityInstance() {
        User user = SecurityEntityFactory.getUserEntityInstance();
        userDAO.add(user);

        SecurityApplication application = SecurityEntityFactory.getApplicationEntityInstance();
        applicationDAO.add(application);

        CompanyImpl company = SecurityEntityFactory.getCompanyEntityInstance();
        companyDAO.add(company);

        CompanyUserImpl companyUser = SecurityEntityFactory.getCompanyUserEntityInstance();
        companyUser.setUser(user);
        companyUser.setCompany(company);
        companyUserDAO.add(companyUser);

        CompanyApplicationImpl companyApplication = SecurityEntityFactory.getCompanyApplicationEntityInstance();
        companyApplication.setApplication(application);
        companyApplication.setCompany(company);
        companyApplicationDAO.add(companyApplication);

        CompanyApplicationUserImpl companyApplicationUser = SecurityEntityFactory.getCompanyApplicationUserEntityInstance();
        companyApplicationUser.setApplication(companyApplication);
        companyApplicationUser.setUser(companyUser);

        return companyApplicationUser;
    }


    @Override
    protected SecurityDAOLocal<CompanyApplicationUser> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(CompanyApplicationUser t) {
        if (t instanceof CompanyApplicationUserEntity) {
            return ((CompanyApplicationUserEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(CompanyApplicationUser t) {
        if (t instanceof CompanyApplicationUserEntity) {
            return ((CompanyApplicationUserEntity) t).getUuid();
        }

        return null;
    }


    @Override
    @Test
    public void testUpdate() {

    }


    @Test
    public void testFindByUserEmailAndAppId() {
        CompanyApplicationUserImpl entity = getEntityInstance();
        String email = entity.getUser().getUser().getEmail();
        String appId = entity.getApplication().getApplication().getAppId();

        dao.add(entity);

        CompanyApplicationUser found = dao.find(entity);
        Assert.assertNotNull(found);

        List<CompanyApplicationUser> all = dao.findByUserEmailAndAppId(email, appId);
        Assert.assertNotNull(all);
        Assert.assertEquals(1, all.size());
        Assert.assertTrue(all.contains(found));

        dao.delete(entity);
    }


    @After
    public void tearDown() {
        List<CompanyApplicationUser> entities = dao.findAll();
        dao.deleteAll(entities);

        List<Company> companies = companyDAO.findAll();
        companyDAO.deleteAll(companies);

        List<Application> applications = applicationDAO.findAll();
        applicationDAO.deleteAll(applications);

        List<User> users = userDAO.findAll();
        userDAO.deleteAll(users);

        List<CompanyUser> companyUsers = companyUserDAO.findAll();
        companyUserDAO.deleteAll(companyUsers);

        List<CompanyApplication> companyApplications = companyApplicationDAO.findAll();
        companyApplicationDAO.deleteAll(companyApplications);
    }
}
