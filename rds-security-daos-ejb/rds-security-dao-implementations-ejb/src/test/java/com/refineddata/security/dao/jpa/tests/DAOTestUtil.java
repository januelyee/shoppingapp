package com.refineddata.security.dao.jpa.tests;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */
public class DAOTestUtil {

    private static EntityManagerFactory entityManagerFactory;


    public static void openEntityMangerFactory() {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("rdsSecurityTest");
        } catch (Throwable ex) {
            ex.printStackTrace();
            throw new ExceptionInInitializerError(ex);
        }//end try
    }//end static block


    public static EntityManager getEntityManager() {
        return entityManagerFactory.createEntityManager();
    }


    public static void shutdown() {
        getEntityManagerFactory().close();
    }


    public static EntityManagerFactory getEntityManagerFactory() {
        return entityManagerFactory;
    }

}
