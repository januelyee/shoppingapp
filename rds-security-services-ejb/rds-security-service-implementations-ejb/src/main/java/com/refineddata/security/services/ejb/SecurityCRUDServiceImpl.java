package com.refineddata.security.services.ejb;

import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.service.specs.SecurityInformationService;
import com.refineddata.security.services.ejb.utils.MethodNameHelper;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Abstract generic implementations for all classes that implements {@link SecurityInformationService} interfaces.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public abstract class SecurityCRUDServiceImpl<T> {
    private static final Logger log = LoggerFactory.getLogger(SecurityCRUDServiceImpl.class);

    protected abstract SecurityDAOLocal<T> getDAO();

    protected abstract String getSecurityInformationClassName();

    private final String NULL_INPUT_EXCEPTION_MESSAGE = "Required information given to the service is null!";

    void update(T t) {

    }

    T find(T t) {
        String methodSignatureStr = (new ServiceMethodNameHelper()).getName();

        if (t == null) {
            log.debug("SERVICE " + methodSignatureStr + " encountered error in finding information for " + getSecurityInformationClassName() +
                ", the required information for finding it is not present.");
            throw new InvalidSecurityServiceInputException(NULL_INPUT_EXCEPTION_MESSAGE);
        }
        log.debug(methodSignatureStr + " finding " + getSecurityInformationClassName() + " information:[" + t + "]");

        return getDAO().find(t);
    }


    void delete(T t) {
        String methodSignatureStr = (new ServiceMethodNameHelper()).getName();
        if (t == null) {
            log.debug("SERVICE " + methodSignatureStr + " encountered error in deleting information for " + getSecurityInformationClassName() +
                ", the required information for deleting it is not present.");
            throw new InvalidSecurityServiceInputException(NULL_INPUT_EXCEPTION_MESSAGE);
        }

        log.debug("SERVICE deleting " + getSecurityInformationClassName() + " information:[" + t + "]");
        getDAO().delete(t);
    }


    List<T> findAll() {
        String methodSignatureStr = (new ServiceMethodNameHelper()).getName();
        log.debug("SERVICE " + methodSignatureStr + " finding all " + getSecurityInformationClassName() + " information");
        return getDAO().findAll();
    }


    void deleteAll(Collection<T> objects) {
        String methodSignatureStr = (new ServiceMethodNameHelper()).getName();
        if (CollectionUtils.isEmpty(objects)) {
            log.warn("SERVICE " + methodSignatureStr + " will not execute because the given list of "
                + getSecurityInformationClassName() + " information is empty.");
        }

        log.debug("SERVICE " + methodSignatureStr + " deleting a total of " + objects.size() + " " + getSecurityInformationClassName() + " information");
        getDAO().deleteAll(objects);
    }


    T create() {
        return null;
    }


    void add(T entity) {

    }


    public T findById(Long id) {
        return null;
    }


    public List<T> findInIds(List<Long> ids) {
        return null;
    }


    public T findByUUID(String uuid) {
        return null;
    }


    public void deleteAllById(List<Long> entityIds) {

    }


    public T copy(T toCopy) {
        return null;
    }


    public List<T> findInUUIDs(List<String> uuids) {
        return null;
    }


    public Map<String, T> findInUUIDsAsMap(List<String> uuids) {
        return null;
    }


    private static class ServiceMethodNameHelper extends MethodNameHelper {
    }
}
