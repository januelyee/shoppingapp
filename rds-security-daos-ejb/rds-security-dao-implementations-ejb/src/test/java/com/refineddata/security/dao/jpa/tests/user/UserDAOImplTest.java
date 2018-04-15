package com.refineddata.security.dao.jpa.tests.user;

import com.refineddata.security.dao.jpa.tests.JPADAOTest2;
import com.refineddata.security.dao.jpa.tests.SecurityEntityFactory;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.jpa.user.UserDAOImpl;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.entities.user.UserEntity;
import org.junit.After;
import org.junit.Before;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */
public class UserDAOImplTest extends JPADAOTest2<User> {

    private UserDAOImpl dao = new UserDAOImpl();

    @Override
    protected User getEntityInstance() {
        return SecurityEntityFactory.getUserEntityInstance();
    }


    @Override
    protected SecurityDAOLocal<User> getEntityDAO() {
        return dao;
    }


    @Override
    protected Long getEntityId(User t) {
        if (t instanceof UserEntity) {
            return ((UserEntity) t).getId();
        }

        return null;
    }


    @Override
    protected String getEntityUuid(User t) {
        if (t instanceof UserEntity) {
            return ((UserEntity) t).getUuid();
        }

        return null;
    }


    @Override
    public void testUpdate() {

    }


    @Before
    public void setup() {
        dao.setEntityManager(entityManager);
    }


    @After
    public void tearDown() {
        List<User> entities = dao.findAll();
        dao.deleteAll(entities);
    }
}
