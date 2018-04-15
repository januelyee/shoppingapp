package com.refineddata.security.dao.jpa.tests.application;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

/**
 * JUnit test class for ApplicationDAOImpl
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */
public class ApplicationDAOImplTest extends JPADAOTest2<Application> {

    private ApplicationDAOImpl dao = new ApplicationDAOImpl();

    @Override
    @Test
    public void testUpdate() {

    }


    @Override
    protected ApplicationEntity getEntityInstance() {
        return SecurityEntityFactory.getApplicationEntityInstance();
    }


    @Override
    protected SecurityDAOLocal<Application> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(Application t) {
        if (t instanceof ApplicationEntity) {
            return ((ApplicationEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(Application t) {
        if (t instanceof ApplicationEntity) {
            return ((ApplicationEntity) t).getUuid();
        }

        return null;
    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<Application> entities = dao.findAll();
        dao.deleteAll(entities);
    }
}
