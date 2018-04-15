package com.refineddata.security.daos.jpa;

import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOConstraintException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityExistsException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.util.UUIDUtil;
import org.eclipse.persistence.jpa.JpaEntityManager;
import org.eclipse.persistence.sessions.CopyGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.FlushModeType;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceException;
import javax.persistence.Query;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */
public abstract class DAOImpl2<T> implements SecurityDAOLocal<T> {

    private static final Logger log = LoggerFactory.getLogger(DAOImpl2.class);

    protected static final String SECURITY_ENTITY_CAST_ERROR_MESSAGE = "The given object cannot be casted to its JPA entity equivalent!";

    @PersistenceContext(unitName = "rdsSecurity")
    private EntityManager entityManager;

    protected abstract Long getSecurityEntityId(T t);
    protected abstract RecordStatus getSecurityEntityRecordStatus(T t);
    protected abstract void setSecurityEntityRecordStatus(T t, RecordStatus recordStatus);

    public EntityManager getEntityManager() {
        return entityManager;
    }


    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }


    @Override
    public boolean isEntityExist(T t) throws InvalidSecurityDAOInputException {
        if (t != null) {
            if (getSecurityEntityId(t) == null) {
                log.error("The " + getEntityClass().getSimpleName() + " id is null");
                throw new InvalidSecurityDAOInputException("The " + getEntityClass().getSimpleName() + " id is null");
            }
        }

        boolean exists = false;
        T found = null;
        try {
            found = find(t);
        } catch (SecurityEntityNotFoundException e) {
            exists = false;
        }

        if (found != null && getSecurityEntityRecordStatus(found).equals(RecordStatus.ACTIVE)) {
            exists = true;
        }

        return exists;
    }


    protected abstract Class getEntityClass();


    @Override
    public void add(T t) throws InvalidSecurityDAOInputException, SecurityEntityExistsException, SecurityDAOException {
        log.debug("Adding " + getEntityClass().getSimpleName() + ": [" + t + "]");

        if (t == null) {
            throw new InvalidSecurityDAOInputException(getEntityClass().getSimpleName() + " is invalid");
        }

        try {
            t = checkUUID(t);
        } catch (NoSuchFieldException e) {
            log.trace("Entity does not have a UUID, skipping check for null");
        } catch (IllegalAccessException e) {
            log.error("An error has occurred trying to determine if the entity has a UUID!");
            throw new SecurityDAOException("An error has occurred trying to determine if the entity has a UUID!", e);
        }

        try {
            setSecurityEntityRecordStatus(t, RecordStatus.ACTIVE);
            entityManager.setFlushMode(FlushModeType.AUTO);
            entityManager.persist(t);
            entityManager.flush();
        } catch (javax.persistence.EntityExistsException e) {
            log.debug(getEntityClass().getSimpleName() + " already exists.");
            throw new SecurityEntityExistsException(getEntityClass().getSimpleName() + " already exists.");
        } catch (Exception e) {
            log.error("A system error has occurred adding " + getEntityClass().getSimpleName() + " [" + t + "]", e);
            throw new SecurityDAOException("A system error has occurred adding " + getEntityClass().getSimpleName() + " [" + t + "]", e);
        }
    }


    @Override
    public void delete(T t) throws InvalidSecurityDAOInputException, SecurityDAOConstraintException, SecurityDAOException {
        log.debug("Delete " + getEntityClass().getSimpleName() + ":[" + t + "]");
        if (t == null) {
            throw new InvalidSecurityDAOInputException(getEntityClass().getSimpleName() + " is invalid");
        }

        try {
            T entityToDelete = find(t);
            setSecurityEntityRecordStatus(entityToDelete, RecordStatus.DELETED);
            entityManager.merge(entityToDelete);
            entityManager.flush();

        } catch (PersistenceException e) {
            log.error("DAO A persistence error has occurred!");

            if (e.getCause().getCause() instanceof MySQLIntegrityConstraintViolationException) {
                throw new SecurityDAOConstraintException("DAO A foreign key constraint check has failed! [" + e.getCause().getMessage() + "]", e);
            } else {
                throw new SecurityDAOException("DAO A persistence error has occurred! [" + e.getCause() + "]", e);
            }
        } catch (SecurityEntityNotFoundException e) {
            log.warn("Cannot delete an already deleted entity.", e);

        } catch (Exception e) {
            log.error("A system error has occurred deleting the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
            throw new SecurityDAOException("A system error has occurred deleting the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
        }
    }


    @Override
    public T find(T t) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException {
        log.debug("Searching for " + getEntityClass().getSimpleName() + "...");
        if (t == null) {
            log.error("The " + getEntityClass().getSimpleName() + " in null");
            throw new InvalidSecurityDAOInputException("The " + getEntityClass().getSimpleName() + " is invalid");
        }

        T found = null;
        try {
            found = (T) entityManager.find(getEntityClass(), getSecurityEntityId(t));

        } catch (Exception e) {
            e.printStackTrace();
            log.error("A system error has occurred finding the " + getEntityClass().getSimpleName() + ": [" + t + "]");
            throw new SecurityDAOException("A system error has occurred finding the " + getEntityClass().getSimpleName() + "." + t + "  " + e.getMessage());
        }

        if (found == null || getSecurityEntityRecordStatus(found).equals(RecordStatus.DELETED)) {
            throw new SecurityEntityNotFoundException(getEntityClass().getSimpleName() + " " + t + " was not found");

        } else {
            log.debug("DAO Found " + getEntityClass().getSimpleName() + " [" + found + "]");
            return found;
        }
    }


    @Override
    public List<T> findAll() throws SecurityDAOException {
        log.debug("Finding all entities of:[" + getEntityClass() + "]");
        try {
            List<T> results = (List<T>) entityManager.createNamedQuery(getEntityClass().getSimpleName() + ".findAll").getResultList();
            log.debug("Found " + results);
            return results;
        } catch (Exception e) {
            log.error("A system error has occurred finding entities of:[" + getEntityClass() + "]", e);
            throw new SecurityDAOException("A system error has occurred finding all entities of:[" + getEntityClass() + "]", e);
        }
    }


    @Override
    public void update(T t) throws InvalidSecurityDAOInputException, SecurityDAOException {
        if (t == null) {
            throw new InvalidSecurityDAOInputException(getEntityClass().getSimpleName() + " is invalid");
        }

        if (getSecurityEntityId(t) == null) {
            add(t);
            return;
        }

        T existing = findById(getSecurityEntityId(t));

        if (getSecurityEntityRecordStatus(existing).equals(RecordStatus.DELETED)) {
            String errorMessage = "Entity not found, it was already deleted.  Revive the entity first before doing any" +
                " update transactions.";
            throw new SecurityEntityNotFoundException(errorMessage);
        }

        setSecurityEntityRecordStatus(t, RecordStatus.ACTIVE);

        try {

            try {
                checkUUID(existing);
            } catch (NoSuchFieldException e) {
                log.trace("Entity does not have a UUID, skipping check for null");
            }

            entityManager.merge(t);

        } catch (SecurityEntityNotFoundException e) {
            log.debug("Entity does not exist in the database, proceeding to add...");
            add(t);

        } catch (IllegalAccessException e) {
            log.error("An error has occurred while trying to update the fields on an entity!");
            throw new SecurityDAOException("An error has occurred while trying to update the fields on an entity!", e);

        } catch (Exception e) {
            log.error("A system error has occurred updating the " + getEntityClass().getSimpleName() + "[" + t + "]", e);
            throw new SecurityDAOException("A system error has occurred updating the " + getEntityClass().getSimpleName() + "[" + t + "]", e);

        }
    }


    @Override
    public void updateFlushClear(T t) {
        update(t);
        entityManager.flush();
        entityManager.clear();
    }


    @Override
    public T findById(Long id) {
        return findById(id, false);
    }


    @Override
    public void detach(Object entity) {
        entityManager.detach(entity);
    }


    @Override
    public List<T> findInIds(List<Long> ids) throws InvalidSecurityDAOInputException, SecurityDAOException {
        log.debug("Searching for " + getEntityClass().getSimpleName() + " objects whose id is in the list [" + ids + "]");
        if (ids == null) {
            log.error("The ID is null");
            throw new InvalidSecurityDAOInputException("The list of entity IDs cannot be null!");
        }

        if (ids.isEmpty()) {
            return new ArrayList<>();
        }
        List<T> found = null;

        try {
            String queryString = "SELECT e FROM " + getEntityClass().getSimpleName() + " e WHERE e.id IN :entityIds " +
                "AND e.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE";

            Query q = entityManager.createQuery(queryString);
            q.setParameter("entityIds", ids);
            found = (List<T>) q.getResultList();
            log.debug("DAO Found " + getEntityClass().getSimpleName() + " [" + found + "]");
            return found;
        } catch (Exception e) {
            e.printStackTrace();
            log.error("A system error has occurred finding the " + getEntityClass().getSimpleName() + " with ids in: [" + ids + "]");
            throw new SecurityDAOException("A system error has occurred finding the " + getEntityClass().getSimpleName() + " with ids in: [" + ids + "]" + e
                .getMessage());
        }
    }


    @Override
    public T findByUUID(String uuid) {
        return null;
    }


    @Override
    public List<T> findInUUIDs(List<String> uuids) {
        log.debug("DAO Searching for all [" + getEntityName() + "] entities in UUIDs " + uuids);

        if (uuids == null) {
            throw new InvalidSecurityDAOInputException("The list of UUIDs cannot be null!");
        }

        if (uuids.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            String queryString = "SELECT e FROM " + getEntityName() + " e WHERE e.uuid IN :uuids " +
                "AND e.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE";

            Query q = entityManager.createQuery(queryString);
            q.setParameter("uuids", uuids);
            List<T> results = q.getResultList();
            log.trace("DAO Found entities " + results);
            return results;

        } catch (IllegalArgumentException e) {
            throw new InvalidSecurityDAOInputException("The entity [" + getEntityName() + "] does not have a uuid field!", e);
        } catch (Exception e) {
            throw new SecurityDAOException("An error has occurred in findInUUIDs!", e);
        }
    }


    @Override
    public void deleteAll(Collection<T> entities) {
        log.debug("Deleting all entities " + entities);

        for (T t : entities) {
            delete(t);
        }

        log.debug("Successfully deleted all entities");
    }


    @Override
    public void addAndClear(T t) {
        add(t);
        entityManager.clear();
    }


    @Override
    public void deleteAllById(List<Long> entityIds) throws InvalidSecurityDAOInputException {
        log.debug("Deleting all [" + getEntityClass().getSimpleName() + "] objects whose id is in the list " + entityIds);

        if (entityIds == null) {
            throw new InvalidSecurityDAOInputException("The list of entity IDs cannot be null!");
        }

        if (entityIds.isEmpty()) {
            return;
        }

        List<T> entitiesToDelete = findInIds(entityIds);
        int entitiesDeleted = 0;
        for (T t : entitiesToDelete) {
            delete(t);
            entitiesDeleted++;
        }

        log.trace("Deleted [" + entitiesDeleted + "] [" + getEntityClass().getSimpleName() + "] objects");
    }


    @Override
    public T copy(T toCopy) throws InvalidSecurityDAOInputException {

        if (toCopy == null) {
            String errorMessage = "Cannot proceed to copying, the object to copy is not defined!";
            log.error(errorMessage);
            throw new InvalidSecurityDAOInputException(errorMessage);
        }


        log.debug("DAO Copying [" + toCopy.getClass().getSimpleName() + "] [" + toCopy + "]");

        CopyGroup copyGroup = new CopyGroup();
        copyGroup.setShouldResetPrimaryKey(true);

        T copy = (T) entityManager.unwrap(JpaEntityManager.class).copy(toCopy, copyGroup);
        return copy;
    }


    @Override
    public List<?> customNativeQuery(String queryString) throws InvalidSecurityDAOInputException, SecurityDAOException {
        log.debug("Running custom JPQL query [" + queryString + "]");

        if (queryString == null) {
            throw new InvalidSecurityDAOInputException("Query cannot be null!");
        }

        try {
            Query query = entityManager.createNativeQuery(queryString);
            return (List<?>) query.getResultList();
        } catch (Exception e) {
            log.error("An error occurred while trying to run jpql query [" + queryString + "]", e);
            throw new SecurityDAOException("An error occurred while trying to run native query [" + queryString + "]", e);
        }
    }


    @Override
    public void refresh(T entity) {
        entityManager.refresh(entity);
    }


    @Override
    public T merge(T entity) {
        return entityManager.merge(entity);
    }


    @Override
    public List<String> getDistinctValuesOfField(String fieldName) {
        return null;
    }


    @Override
    public T findById(Long id, boolean bypassCache) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException {
        log.debug("Searching for " + getEntityClass().getSimpleName() + " by ID [" + id + "]");
        if (id == null) {
            log.error("The ID is null");
            throw new InvalidSecurityDAOInputException("The ID is invalid");
        }

        T found = null;
        try {
            if (bypassCache) {
                Map<String, Object> properties = new HashMap<>();
                properties.put("javax.persistence.cache.retrieveMode", "BYPASS");

                found = (T) entityManager.find(getEntityClass(), id, properties);

            } else {
                found = (T) entityManager.find(getEntityClass(), id);

            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("A system error has occurred finding the " + getEntityClass().getSimpleName() + " with ID: [" + id + "]");
            throw new SecurityDAOException("A system error has occurred finding the " + getEntityClass().getSimpleName() + " with ID." + id + "  " + e.getMessage());
        }

        if (found == null || getSecurityEntityRecordStatus(found).equals(RecordStatus.DELETED)) {
            throw new SecurityEntityNotFoundException(getEntityClass().getSimpleName() + " with ID " + id + " was not found");
        } else {
            return found;
        }
    }


    private T checkUUID(T entity) throws IllegalAccessException, NoSuchFieldException {
        Field uuidField = getEntityClass().getDeclaredField("uuid");
        uuidField.setAccessible(true);
        String uuid = (String) uuidField.get(entity);

        if (uuid == null) {
            log.debug("No uuid set, setting now...");
            uuidField.set(entity, UUIDUtil.generateUUIDString());
        } else {
            log.trace("UUID already set, continuing...");
        }

        return entity;
    }


    private String getEntityName() {
        return getEntityClass().getSimpleName();
    }

}
