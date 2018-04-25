package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class DAOTestUtil {
    private static EntityManagerFactory entityManagerFactory;


    public static void openEntityMangerFactory() {
        try {
            entityManagerFactory = Persistence.createEntityManagerFactory("shoppingTest");
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
