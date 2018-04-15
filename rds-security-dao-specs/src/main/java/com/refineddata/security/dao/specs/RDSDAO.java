package com.refineddata.security.dao.specs;

import java.util.Collection;
import java.util.List;

/**
 * Stub code
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public interface RDSDAO<T> {

    /**
     * Adds the entity to the datastore
     */
    void add(T t);

    /**
     * Adds the entity to the datastore and clears the objects in memory for the transaction
     */
    void addAndClear(T t);

    /**
     * Delete the entity from the datastore
     */
    void delete(T t);

    /**
     * Update the existing entity with the information in the argument
     */
    void update(T t);

    /**
     * Update the existing entity with the information in the argument, flushes the transaction
     * and clears the objects in memory for the transaction
     */
    void updateFlushClear(T t);

    /**
     * Searches for and returns all entities
     *
     * @return List of all the objects containing the data.
     */
    List<T> findAll();

    /**
     * Searches for and returns a specific entity
     */
    T find(T t);

    /**
     * Searches for and returns a specific entity from a list of ids
     */
    List<T> findInIds(List<Long> ids);

    /**
     * Searches for an entity by id
     */
    T findById(Long id);

    /**
     * Returns true if entity exists in the database
     */
    boolean isEntityExist(T t);

    /**
     * Return an entity with matching UUID
     */
    T findByUUID(String uuid);

    /**
     * Delete all entities in the specified collection
     *
     * @param entities The entities to delete
     */
    void deleteAll(Collection<T> entities);

    /**
     * Delete all entities with an ID in the specified collection
     *
     * @param entityIds The list of entity IDs to delete
     */
    void deleteAllById(List<Long> entityIds);

    /**
     * This method will copy an entity which can then be persisted as a new entity. By default it copies all fields.
     * Override the method in the entity's DAO to customize what is copied
     *
     * @param toCopy The entity to copy
     * @return the new copy of the entity
     */
    T copy(T toCopy);

    /**
     * Find all entities which have a UUID in the list of Strings
     *
     * @param uuids The list of uuids to search for
     * @return The entities which have a UUID in the list
     */
    List<T> findInUUIDs(List<String> uuids);

    /**
     * runs a native db query
     */
    List<?> customNativeQuery(String queryString);

    /**
     * Detach an entity from the JPA transaction
     *
     * @param entity The entity to detach
     */
    void detach(Object entity);

    /**
     * Refresh the state of an entity from the database.
     *
     * @param entity The entity to refresh
     */
    void refresh(T entity);

    /**
     * Merges the entity to the transaction.
     *
     * @param entity The entity to merge
     */
    T merge(T entity);

    /**
     * This method will return a distinct list of values of a single column for an entity
     *
     * @param fieldName The field(column) of the entity
     * @return The distinct list of values from {@code fieldName}
     */
    List<String> getDistinctValuesOfField(String fieldName);

}
