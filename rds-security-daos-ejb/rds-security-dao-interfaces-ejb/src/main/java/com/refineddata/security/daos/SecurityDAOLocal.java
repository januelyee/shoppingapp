package com.refineddata.security.daos;

import com.refineddata.security.dao.specs.SecurityDAO;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOConstraintException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityExistsException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;

import java.util.Collection;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public interface SecurityDAOLocal<T> extends SecurityDAO<T> {

    @Override
    boolean isEntityExist(T t) throws InvalidSecurityDAOInputException;

    @Override
    void add(T t) throws InvalidSecurityDAOInputException, SecurityEntityExistsException, SecurityDAOException;

    @Override
    void addAndClear(T t) throws InvalidSecurityDAOInputException, SecurityEntityExistsException, SecurityDAOException;

    @Override
    void delete(T t) throws InvalidSecurityDAOInputException, SecurityDAOConstraintException, SecurityDAOException;

    @Override
    T find(T t) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException;

    @Override
    List<T> findAll() throws SecurityDAOException;

    @Override
    void update(T t) throws InvalidSecurityDAOInputException, SecurityDAOException;

    @Override
    void updateFlushClear(T t) throws InvalidSecurityDAOInputException, SecurityDAOException;

    @Override
    T findById(Long id) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException;

    T findById(Long id, boolean bypassCache) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException;

    @Override
    List<T> findInIds(List<Long> ids) throws InvalidSecurityDAOInputException, SecurityDAOException;

    @Override
    T findByUUID(String uuid) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException;

    @Override
    List<T> findInUUIDs(List<String> uuids) throws InvalidSecurityDAOInputException, SecurityDAOException;

    @Override
    void deleteAll(Collection<T> entities) throws InvalidSecurityDAOInputException, SecurityDAOConstraintException, SecurityDAOException;

    @Override
    void deleteAllById(List<Long> entityIds) throws InvalidSecurityDAOInputException;

    @Override
    T copy(T toCopy) throws InvalidSecurityDAOInputException;

}
