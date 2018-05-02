package com.januelyee.shoppingcart.daos.ejb.jpa;

import com.januelyee.shoppingcart.daos.ejb.exceptions.*;
import com.januelyee.shoppingcart.domain.template.CRUDOperations;
import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.FlushModeType;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceException;
import java.util.Collection;
import java.util.List;

public abstract class CRUDOperationsJPAImpl<T> implements CRUDOperations<T> {

    private static final Logger log = LoggerFactory.getLogger(CRUDOperationsJPAImpl.class);

    @PersistenceContext(unitName = "shopping")
    private EntityManager entityManager;

    protected abstract Class getEntityClass();
    protected abstract Long getShoppingEntityId(T t);
    protected abstract void setShoppingEntityId(Long id, T t);
    protected abstract void checkForInputErrors(T t);

    public EntityManager getEntityManager() {
        return entityManager;
    }
    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public void create(T t) throws DAOInvalidInputException, DAORecordExistsException, DAOShoppingException {
        log.debug("Adding " + getEntityClass().getSimpleName() + ": [" + t + "]");

        checkForInputErrors(t);

        try {
            entityManager.setFlushMode(FlushModeType.AUTO);
            entityManager.persist(t);
            entityManager.flush();

        } catch (javax.persistence.EntityExistsException e) {
            log.debug(getEntityClass().getSimpleName() + " already exists.");
            throw new DAORecordExistsException(getEntityClass().getSimpleName() + " already exists.");
        } catch (Exception e) {
            log.error("A system error has occurred adding " + getEntityClass().getSimpleName() + " [" + t + "]", e);
            throw new DAOShoppingException("A system error has occurred adding " + getEntityClass().getSimpleName() + " [" + t + "]", e);
        }
    }

    @Override
    public void delete(T t) throws DAOInvalidInputException, DAOShoppingConstraintException, DAOShoppingException {
        log.debug("Delete " + getEntityClass().getSimpleName() + ":[" + t + "]");
        if (t == null) {
            throw new DAOInvalidInputException(getEntityClass().getSimpleName() + " is invalid");
        }

        try {
            T entityToDelete = find(t);
            entityManager.remove(entityManager.merge(entityToDelete));
            entityManager.flush();

        } catch (PersistenceException e) {
            log.error("DAO A persistence error has occurred!");

            if (e.getCause().getCause() instanceof MySQLIntegrityConstraintViolationException) {
                throw new DAOShoppingConstraintException("DAO A foreign key constraint check has failed! [" + e.getCause().getMessage() + "]", e);
            } else {
                throw new DAOShoppingException("DAO A persistence error has occurred! [" + e.getCause() + "]", e);
            }
        } catch (DAORecordNotFoundException e) {
            log.warn("Cannot delete an already deleted entity.", e);

        } catch (Exception e) {
            log.error("A system error has occurred deleting the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
            throw new DAOShoppingException("A system error has occurred deleting the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
        }
    }

    @Override
    public List<T> findAll() throws DAOShoppingException {
        log.debug("Finding all entities of:[" + getEntityClass() + "]");
        try {
            entityManager.clear();
            List<T> results = (List<T>) entityManager.createNamedQuery(getEntityClass().getSimpleName() + ".findAll").getResultList();
            log.debug("Found " + results);
            return results;

        } catch (Exception e) {
            log.error("A system error has occurred finding entities of:[" + getEntityClass() + "]", e);
            throw new DAOShoppingException("A system error has occurred finding all entities of:[" + getEntityClass() + "]", e);
        }
    }

    @Override
    public T find(T t) throws DAOInvalidInputException, DAORecordNotFoundException, DAOShoppingException {
        log.debug("Searching for " + getEntityClass().getSimpleName() + "...");
        if (t == null) {
            log.error("The " + getEntityClass().getSimpleName() + " in null");
            throw new DAOInvalidInputException("The " + getEntityClass().getSimpleName() + " is invalid");
        }

        T found;
        try {
            entityManager.clear();
            found = (T) entityManager.find(getEntityClass(), getShoppingEntityId(t));

        } catch (Exception e) {
            e.printStackTrace();
            log.error("A system error has occurred finding the " + getEntityClass().getSimpleName() + ": [" + t + "]");
            throw new DAOShoppingException("A system error has occurred finding the " + getEntityClass().getSimpleName() + "." + t + "  " + e.getMessage());
        }

        if (found == null) {
            throw new DAORecordNotFoundException(getEntityClass().getSimpleName() + " " + t + " was not found");

        } else {
            log.debug("DAO Found " + getEntityClass().getSimpleName() + " [" + found + "]");
            return found;
        }
    }


    @Override
    public void deleteAll(Collection<T> toDelete) {
        log.debug("Deleting all entities " + toDelete);

        for (T t : toDelete) {
            delete(t);
        }

        log.debug("Successfully deleted all entities");
    }
}
