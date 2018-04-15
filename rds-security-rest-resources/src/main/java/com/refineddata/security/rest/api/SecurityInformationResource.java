package com.refineddata.security.rest.api;

import javax.ws.rs.core.Response;
import java.util.Collection;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public interface SecurityInformationResource<T> {
    Response update(T t);
    Response find(T t);
    Response delete(T t);
    Response findAll();
    Response deleteAll(Collection<T> objects);

}
