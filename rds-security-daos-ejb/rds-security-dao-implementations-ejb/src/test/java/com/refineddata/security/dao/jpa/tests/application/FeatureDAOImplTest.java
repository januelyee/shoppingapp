package com.refineddata.security.dao.jpa.tests.application;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.application.ApplicationDAOImpl;
import com.refineddata.security.daos.jpa.application.FeatureDAOImpl;
import com.refineddata.security.daos.jpa.application.ModuleDAOImpl;
import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.domain.concrete.application.SecurityApplicationModuleFeature;
import com.refineddata.security.entities.application.FeatureEntity;
import org.junit.After;
import org.junit.Before;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */
public class FeatureDAOImplTest extends JPADAOTest2<ApplicationModuleFeature> {

    private FeatureDAOImpl dao = new FeatureDAOImpl();
    private ModuleDAOImpl moduleDAO = new ModuleDAOImpl();
    private ApplicationDAOImpl applicationDAO = new ApplicationDAOImpl();


    @Override
    protected ApplicationModuleFeature getEntityInstance() {
        Application application = SecurityEntityFactory.getApplicationEntityInstance();
        applicationDAO.add(application);

        ApplicationModule module = SecurityEntityFactory.getModuleEntityInstance();
        module.setParentApplication(application);
        moduleDAO.add(module);

        SecurityApplicationModuleFeature feature = SecurityEntityFactory.getFeatureEntityInstance();
        feature.setParentModule(module);

        return feature;
    }


    @Override
    protected SecurityDAOLocal<ApplicationModuleFeature> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(ApplicationModuleFeature t) {
        if (t instanceof FeatureEntity) {
            return ((FeatureEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(ApplicationModuleFeature t) {
        if (t instanceof FeatureEntity) {
            return ((FeatureEntity) t).getUuid();
        }

        return null;
    }


    @Override
    public void testUpdate() {

    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
        moduleDAO.setEntityManager(entityManager);
        applicationDAO.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<ApplicationModuleFeature> entities = dao.findAll();
        dao.deleteAll(entities);

        List<ApplicationModule> modules = moduleDAO.findAll();
        moduleDAO.deleteAll(modules);

        List<Application> applications = applicationDAO.findAll();
        applicationDAO.deleteAll(applications);
    }
}
