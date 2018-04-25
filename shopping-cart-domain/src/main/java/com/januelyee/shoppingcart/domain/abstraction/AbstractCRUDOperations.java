package com.januelyee.shoppingcart.domain.abstraction;

import com.januelyee.shoppingcart.domain.template.CRUDOperations;
import com.januelyee.shoppingcart.domain.exceptions.RecordNotFoundException;

import java.util.*;

public abstract class AbstractCRUDOperations<T> implements CRUDOperations<T> {

    private Map<Long, T> recs = new HashMap<>();
    protected abstract Long getRecordId(T t);
    protected abstract void setRecordId(T t);

    protected Map<Long, T> getRecs() {
        return recs;
    }

    @Override
    public void create(T t) {
        if (getRecordId(t) == null || getRecordId(t) == 0) {
            long pk = new Random().nextLong();
            setRecordId(t);
        }
        getRecs().put(getRecordId(t), t);
    }

    @Override
    public void update(T t) {
        getRecs().put(getRecordId(t), t);
    }

    @Override
    public void delete(T t) {
        getRecs().remove(getRecordId(t));
    }

    @Override
    public void deleteAll(Collection<T> toDelete) {
        for (T t : toDelete) {
            recs.remove(getRecordId(t));
        }
    }

    @Override
    public List<T> findAll() {
        return new ArrayList<>(getRecs().values());
    }

    @Override
    public T find(T t) {
        T e = recs.get(getRecordId(t));
        if (e != null) {
            return e;
        }
        throw new RecordNotFoundException();
    }
}
