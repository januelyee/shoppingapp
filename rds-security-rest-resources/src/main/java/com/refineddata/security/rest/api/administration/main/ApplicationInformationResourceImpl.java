package com.refineddata.security.rest.api.administration.main;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.rest.api.SecurityInformationResource;
import com.refineddata.security.rest.api.SecurityInformationResourceImpl;
import com.refineddata.security.service.specs.SecurityInformationService;
import com.refineddata.security.services.administration.main.ApplicationInformationServiceLocal;

import javax.ejb.EJB;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import java.util.Collection;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/15/2016
 * @since 1.0
 */

@Path("administration/information")
public class ApplicationInformationResourceImpl extends SecurityInformationResourceImpl<Application> implements SecurityInformationResource<Application> {

    @EJB
    private ApplicationInformationServiceLocal applicationInformationServiceLocal;


    @Override
    protected SecurityInformationService<Application> getMainInformationService() {
        return applicationInformationServiceLocal;
    }


    @Override
    protected ApplicationEntity getSecurityInformationInstance() {
        return new ApplicationEntity();
    }


    @Override
    protected ApplicationEntity[] getSecurityInformationArrayInstance(int arraySize) {
        return new ApplicationEntity[arraySize];
    }


    @Override
    @PUT
    public Response update(Application t) {
        return super.update(t);
    }


    @Override
    @POST
    @Path("/find")
    public Response find(Application t) {
        return super.find(t);
    }


    @Override
    @DELETE
    public Response delete(Application t) {
        return super.delete(t);
    }


    @Override
    @GET
    public Response findAll() {
        return super.findAll();
    }


    @Override
    @POST
    @Path("/multipledelete")
    public Response deleteAll(Collection<Application> objects) {
        return super.deleteAll(objects);
    }
}
