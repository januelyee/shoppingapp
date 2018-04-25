package com.januelyee.shoppingcart.domain.template;

import java.util.Collection;
import java.util.List;

/**
 * An interface that deals with general CRUD operations.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Created 2017-04-25
 * @since 4.1.1
 */

public interface CRUDOperations<T> {
    void create(T t);
    void update(T t);
    void delete(T t);
    void deleteAll(Collection<T> toDelete);
    List<T> findAll();
    T find(T t);
}
