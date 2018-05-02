package com.januelyee.shoppingtcart.daos.ejb.jpa.test;

import com.januelyee.shoppingcart.daos.ejb.exceptions.DAORecordNotFoundException;
import com.januelyee.shoppingcart.daos.ejb.jpa.CRUDOperationsJPAImpl;
import org.apache.commons.beanutils.BeanUtils;
import org.junit.*;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;

public abstract class CRUDOperationsTest<T> {

    private EntityTransaction txw;
    protected EntityManager entityManager;
    private T entity;

    protected abstract T getEntityInstance();
    protected abstract CRUDOperationsJPAImpl<T> getEntityDAO();

    protected abstract Long getEntityId(T t);
    protected abstract void setEntityId(Long id, T t);

    @BeforeClass
    public static void startup() {
        DAOTestUtil.openEntityMangerFactory();
    }


    @AfterClass
    public static void shutdown() throws Exception {
        DAOTestUtil.getEntityManagerFactory().close();
    }


    public abstract void testUpdate(); // Since the superclass RiskEntity only have setId() and getId() methods, we have to push this down.


    @Before
    public void startTransaction() {
        entityManager = DAOTestUtil.getEntityManager();
        System.out.println("Starting transaction");
        txw = entityManager.getTransaction();
        txw.begin();
    }


    @Test
    public void testFind() {
        entity = getEntityInstance();
        getEntityDAO().create(entity);

        T found = getEntityDAO().find(entity);
        Assert.assertNotNull(found);
        getEntityDAO().delete(entity);
    }


    @Test
    public void testFindById() {
        entity = getEntityInstance();
        getEntityDAO().create(entity);

        T found = getEntityDAO().find(entity);
        T foundAgain = getEntityDAO().find(found);
        Assert.assertNotNull(foundAgain);
        getEntityDAO().delete(entity);
    }


    @Test
    public void testCreate() {
        entity = getEntityInstance();
        getEntityDAO().create(entity);

        T e = getEntityDAO().find(entity);
        Assert.assertNotNull(e);
        // getEntityDAO().delete(entity);
    }


    @Test(expected = DAORecordNotFoundException.class)
    public void testDelete() {
        entity = getEntityInstance();
        getEntityDAO().create(entity);

        T found = getEntityDAO().find(entity);
        Assert.assertNotNull(found);
        getEntityDAO().delete(entity);

        getEntityDAO().find(entity);
    }


    @Test
    public void testFindAll() {
        entity = getEntityInstance();
        List<T> all = getEntityDAO().findAll();
        int before = all.size();
        getEntityDAO().create(entity);

        List<T> newAll = getEntityDAO().findAll();

        Assert.assertEquals(before + 1, newAll.size());

        getEntityDAO().delete(entity);
    }


    @Test
    public void testDeleteAll() {
        entity = getEntityInstance();
        T entity2 = getEntityInstance();

        getEntityDAO().create(entity);
        getEntityDAO().create(entity2);

        List<T> results = getEntityDAO().findAll();

        results.retainAll(Arrays.asList(entity, entity2));

        getEntityDAO().deleteAll(results);

        List<T> newResults = getEntityDAO().findAll();
        Assert.assertFalse(newResults.contains(entity));
        Assert.assertFalse(newResults.contains(entity2));
    }


    /**
     * @param fieldName The object's field to modify. Preferably choose a field that is used in the equals() method as that is what is used to make sure the
     *                  update has taken place
     * @param newValue  The new value to set fieldName to.
     */
    protected void testUpdate(String fieldName, Object newValue) {
        entity = getEntityInstance();
        getEntityDAO().create(entity);

        entityManager.detach(entity);
        T found = getEntityDAO().find(entity);
        Assert.assertNotNull(found);

        try {
            BeanUtils.setProperty(entity, fieldName, newValue);
            Assert.assertNotEquals(BeanUtils.getProperty(entity, fieldName), BeanUtils.getProperty(found, fieldName));
        } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
            e.printStackTrace();
            Assert.fail(e.getMessage());
        }


        getEntityDAO().update(entity);

        Assert.assertEquals(entity, found);

        getEntityDAO().delete(entity);
    }


    @After
    public void cleanup() {
        List<T> entities = getEntityDAO().findAll();
        getEntityDAO().deleteAll(entities);

        commitTransaction();
        closeTransaction();
    }


    private void createNewTransaction() {
        if (!txw.isActive()) {
            txw.begin();
        }
    }


    protected void commitTransaction() {
        if (txw.isActive()) {
            try {
                System.out.println("Committing");
                txw.commit();

            } catch (Throwable t) {
                System.out.println("Exception: " + t.getMessage() + ":" + t.getClass());
            }
        } else {
            System.out.println("Transaction is not active");
        }
    }


    private void closeTransaction() {
        if (entityManager.isOpen()) {
            entityManager.close();
        }
    }
}
