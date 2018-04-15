package com.refineddata.security.service.specs;

import java.util.Collection;
import java.util.List;

/**
 * Interface for managing any information about security.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public interface SecurityInformationService<T> {
    void update(T t);
    T find(T t);
    void delete(T t);
    List<T> findAll();
    void deleteAll(Collection<T> objects);
}
