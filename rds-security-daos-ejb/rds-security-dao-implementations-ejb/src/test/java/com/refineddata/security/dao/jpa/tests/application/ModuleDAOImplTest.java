package com.refineddata.security.dao.jpa.tests.application;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.daos.jpa.application.ModuleDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.entities.application.ModuleEntity;
import org.junit.After;
import org.junit.Before;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */
public class ModuleDAOImplTest extends JPADAOTest2<ApplicationModule> {

    private ModuleDAOImpl dao = new ModuleDAOImpl();
    private ApplicationDAOImpl applicationDAO = new ApplicationDAOImpl();

    @Override
    protected ApplicationModule getEntityInstance() {
        Application application = new ApplicationEntity();
        applicationDAO.add(application);

        ApplicationModule module = SecurityEntityFactory.getModuleEntityInstance();
        module.setParentApplication(application);

        return module;
    }


    @Override
    protected SecurityDAOLocal<ApplicationModule> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(ApplicationModule t) {
        if (t instanceof ModuleEntity) {
            return ((ModuleEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(ApplicationModule t) {
        if (t instanceof ModuleEntity) {
            return ((ModuleEntity) t).getUuid();
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
        List<ApplicationModule> entities = dao.findAll();
        dao.deleteAll(entities);

        List<Application> applications = applicationDAO.findAll();
        applicationDAO.deleteAll(applications);
    }
}
