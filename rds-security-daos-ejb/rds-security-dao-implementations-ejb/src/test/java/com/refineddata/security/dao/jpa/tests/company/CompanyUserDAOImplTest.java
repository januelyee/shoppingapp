package com.refineddata.security.dao.jpa.tests.company;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.company.CompanyDAOImpl;
import com.refineddata.security.daos.jpa.company.CompanyUserDAOImpl;
import com.refineddata.security.daos.jpa.user.UserDAOImpl;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.concrete.company.AuthenticationInformationImpl;
import com.refineddata.security.entities.company.CompanyUserEntity;
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
public class CompanyUserDAOImplTest extends JPADAOTest2<CompanyUser> {

    private CompanyUserDAOImpl dao = new CompanyUserDAOImpl();
    private CompanyDAOImpl companyDAO = new CompanyDAOImpl();
    private UserDAOImpl userDAO = new UserDAOImpl();


    @Override
    protected CompanyUser getEntityInstance() {
        String passwordStr = "testpassword";
        byte[] password = passwordStr.getBytes();

        User user = SecurityEntityFactory.getUserEntityInstance();
        userDAO.add(user);

        Company company = SecurityEntityFactory.getCompanyEntityInstance();
        companyDAO.add(company);

        AuthenticationInformationImpl authenticationInformation = SecurityEntityFactory.getAuthenticationInformationEntityInstance();
        authenticationInformation.setAuthenticationCode(password);

        CompanyUser companyUser = SecurityEntityFactory.getCompanyUserEntityInstance();
        companyUser.setCompany(company);
        companyUser.setUser(user);
        companyUser.addAuthenticationInformation(authenticationInformation);

        return companyUser;
    }


    @Override
    protected SecurityDAOLocal<CompanyUser> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(CompanyUser t) {
        if (t instanceof CompanyUserEntity) {
            return ((CompanyUserEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(CompanyUser t) {
        if (t instanceof CompanyUserEntity) {
            return ((CompanyUserEntity) t).getUuid();
        }

        return null;
    }


    @Override
    public void testUpdate() {

    }


    @Test
    public void testFindByCompanyAndEmail() {
        CompanyUser entity = getEntityInstance();
        String email = entity.getUser().getEmail();
        Company company = entity.getCompany();

        dao.add(entity);

        CompanyUser found = dao.find(entity);
        Assert.assertNotNull(found);

        CompanyUser foundAgain = dao.findByCompanyAndEmail(company, email);
        Assert.assertNotNull(foundAgain);

        dao.delete(entity);
    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
        companyDAO.setEntityManager(entityManager);
        userDAO.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<CompanyUser> entities = dao.findAll();
        dao.deleteAll(entities);

        List<User> users = userDAO.findAll();
        userDAO.deleteAll(users);

        List<Company> companies = companyDAO.findAll();
        companyDAO.deleteAll(companies);
    }
}
