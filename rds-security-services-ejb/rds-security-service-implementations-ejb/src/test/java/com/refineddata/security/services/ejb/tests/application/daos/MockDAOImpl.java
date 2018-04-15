package com.refineddata.security.services.ejb.tests.application.daos;

import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.daos.exceptions.SecurityDAOMethodNotImplementedException;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * General implementation template for all Mock DAO implementation classes for testng.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */
public abstract class MockDAOImpl<T> implements SecurityDAOLocal<T>{

    private Map<Long, T> recs = new HashMap<>();

    protected abstract Long getSecurityEntityId(T t);
    protected abstract RecordStatus getSecurityEntityRecordStatus(T t);
    protected abstract void setSecurityEntityRecordStatus(T t, RecordStatus recordStatus);
    protected abstract void setSecurityEntityId(T t, Long id);


    protected Map<Long, T> getRecs() {
        return Collections.unmodifiableMap(recs);
    }


    @Override
    public void add(T t) {
        if (getSecurityEntityId(t) == null || getSecurityEntityId(t).longValue() == 0) {
            long pk = new Random().nextLong();
            setSecurityEntityId(t, Long.valueOf(pk));
        }
        setSecurityEntityRecordStatus(t, RecordStatus.ACTIVE);
        recs.put(getSecurityEntityId(t), t);
    }


    @Override
    public void delete(T t) {
        setSecurityEntityRecordStatus(t, RecordStatus.DELETED);
        recs.remove(getSecurityEntityId(t));
    }


    @Override
    public void update(T t) {
        setSecurityEntityRecordStatus(t, RecordStatus.ACTIVE);
        recs.put(getSecurityEntityId(t), t);
    }


    @Override
    @SuppressWarnings("unchecked")
    public List<T> findAll() {
        return new ArrayList<>(recs.values());
    }


    @Override
    public T find(T t) {
        T e = recs.get(getSecurityEntityId(t));
        if (e != null) {
            return e;
        }
        throw new SecurityEntityNotFoundException();
    }

    @Override
    public List<T> findInIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new InvalidSecurityServiceInputException("IDs are empty or null!");
        }
        List<T> returnList = new ArrayList<>();
        for(int i=0;i<recs.size();i++){

            T t = recs.get(Long.valueOf(i));
            Long id = getSecurityEntityId(t);

            if(ids.contains(id)){
                returnList.add(recs.get(Long.valueOf(i)));
            }
        }
        return returnList;
    }


    @Override
    public T findById(Long id, boolean bypassCache)
        throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException {

        throw new SecurityDAOMethodNotImplementedException("findById(Long, boolean) is not applicable outside of JPA transactions");
    }


    @Override
    public List<?> customNativeQuery(String queryString) {
        throw new SecurityDAOMethodNotImplementedException("findById(Long, boolean) is not applicable outside of JPA transactions");
    }


    @Override
    public T findById(Long id) {
        T e = recs.get(id);
        if (e != null) {
            return e;
        }
        throw new SecurityEntityNotFoundException();
    }


    @Override
    public boolean isEntityExist(T t) {
        T e = recs.get(getSecurityEntityId(t));
        return e != null;
    }


    @Override
    public T findByUUID(String uuid) {
        return null;
    }


    @Override
    public void deleteAll(Collection<T> entities) {
        for (T t : entities) {
            recs.remove(getSecurityEntityId(t));
        }
    }


    @Override
    public void addAndClear(T t) {
        add(t);
    }


    @Override
    public void updateFlushClear(T t) {
        update(t);
    }


    @Override
    public void detach(Object entity) {
        throw new SecurityDAOMethodNotImplementedException("detach(Object) is not applicable outside of JPA transactions");
    }


    @Override
    public void refresh(T entity) {
        throw new SecurityDAOMethodNotImplementedException("refresh(Object) is not applicable outside of JPA transactions");
    }


    @Override
    public T merge(T entity) {
        throw new SecurityDAOMethodNotImplementedException("merge(Object) is not applicable outside of JPA transactions");
    }


    @Override
    public List<String> getDistinctValuesOfField(String fieldName) {
        return null;
    }


    @Override
    @SuppressWarnings("unchecked")
    public T copy(T toCopy) {
        try {
            return (T) BeanUtils.cloneBean(toCopy);
        } catch (IllegalAccessException | InstantiationException | InvocationTargetException | NoSuchMethodException e) {
            throw new SecurityDAOException("An error has occurred in copy(T)!", e);
        }
    }


    @Override
    public void deleteAllById(List<Long> entityIds) {
        for (Long entityId : entityIds) {
            recs.remove(entityId);
        }
    }


    @Override
    public List<T> findInUUIDs(List<String> uuids) {
        return new ArrayList<>();
    }

}
