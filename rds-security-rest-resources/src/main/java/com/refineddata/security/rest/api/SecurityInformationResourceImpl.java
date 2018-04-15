package com.refineddata.security.rest.api;

import com.refineddata.security.service.specs.SecurityInformationService;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import com.refineddata.security.services.exceptions.SecurityServiceDataNotFoundException;
import com.refineddata.security.services.exceptions.SecurityServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/15/2016
 * @since 1.0
 */
public abstract class SecurityInformationResourceImpl<T> extends SecurityResourceImpl implements SecurityInformationResource<T> {

    private static Logger log = LoggerFactory.getLogger(SecurityInformationResourceImpl.class);

    protected abstract SecurityInformationService<T> getMainInformationService();

    protected abstract T getSecurityInformationInstance();

    protected abstract T[] getSecurityInformationArrayInstance(int arraySize);

    @Override
    public Response update(T t) {
        try {
            log.debug("REST requesting update of " + getSecurityInformationInstance().getClass().getName() + " [" + t + "]");
            getMainInformationService().update(t);
            log.debug("REST successfully updated " + getSecurityInformationInstance().getClass().getName() + " [" + t + "]");
            return Response.ok().build();

        } catch (InvalidSecurityServiceInputException e) {
            return SecurityResourceImpl.generateInvalidSecurityServiceInputResponse(e);

        } catch (SecurityServiceDataNotFoundException e) {
            return SecurityResourceImpl.generateSecurityServiceDataNotFoundResponse(e);

        } catch (SecurityServiceException e) {
            return SecurityResourceImpl.generateSecurityServiceErrorResponse(e);

        } catch (Exception e) {
            return SecurityResourceImpl.generateGeneralErrorResponse(e);
        }
    }


    @Override
    public Response find(T t) {
        try {
            log.debug("REST requesting to find latest data for [" + t + "]");
            T found = getMainInformationService().find(t);
            return Response.ok(found).build();

        } catch (SecurityServiceDataNotFoundException e) {
            return SecurityResourceImpl.generateSecurityServiceDataNotFoundResponse(e);

        } catch (SecurityServiceException e) {
            return SecurityResourceImpl.generateSecurityServiceErrorResponse(e);

        } catch (Exception e) {
            return SecurityResourceImpl.generateGeneralErrorResponse(e);
        }
    }


    @Override
    public Response delete(T t) {
        try {
            log.debug("REST request deletion of " + getSecurityInformationInstance().getClass().getName() + " [" + t + "]");
            getMainInformationService().delete(t);
            log.debug("REST Successfully deleted " + getSecurityInformationInstance().getClass().getName() + " [" + t + "]");
            return Response.ok().build();
        } catch (InvalidSecurityServiceInputException e) {
            return SecurityResourceImpl.generateInvalidSecurityServiceInputResponse(e);

        } catch (SecurityServiceException e) {
            return SecurityResourceImpl.generateSecurityServiceErrorResponse(e);

        } catch (Exception e) {
            return SecurityResourceImpl.generateGeneralErrorResponse(e);

        }

    }


    @Override
    public Response findAll() {
        try {
            log.debug("REST Finding all " + getSecurityInformationInstance().getClass().getName() + " entities");
            List<T> t = getMainInformationService().findAll();
            T[] toReturn = t.toArray(getSecurityInformationArrayInstance(t.size()));
            return Response.ok(toReturn).build();

        } catch (SecurityServiceException e) {
            return SecurityResourceImpl.generateSecurityServiceErrorResponse(e);

        } catch (Exception e) {
            return SecurityResourceImpl.generateGeneralErrorResponse(e);

        }
    }


    @Override
    public Response deleteAll(Collection<T> objects) {
        try {
            log.debug("REST request bulk deletion of " + getSecurityInformationInstance().getClass().getName() + " [" + objects + "]");
            getMainInformationService().deleteAll(objects);
            log.debug("REST successfully executed request for bulk deletion of " + getSecurityInformationInstance().getClass().getName() + " [" + objects + "]");
            return Response.ok().build();
        } catch (InvalidSecurityServiceInputException e) {
            return SecurityResourceImpl.generateInvalidSecurityServiceInputResponse(e);

        } catch (SecurityServiceException e) {
            return SecurityResourceImpl.generateSecurityServiceErrorResponse(e);

        } catch (Exception e) {
            return SecurityResourceImpl.generateGeneralErrorResponse(e);

        }
    }
}
