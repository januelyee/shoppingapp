package com.refineddata.security.rest.api.administration.main;

import com.refineddata.security.rest.api.SecurityResourceImpl;
import com.refineddata.security.rest.api.administration.main.dataobjects.RESTAppRegistryRemovalResponse;
import com.refineddata.security.rest.api.administration.main.dataobjects.RESTAppRegistryRequest;
import com.refineddata.security.service.specs.administration.main.AppRegistryRemovalResponse;
import com.refineddata.security.service.specs.administration.main.AppRegistryRequest;
import com.refineddata.security.service.specs.administration.main.AppRegistryResponse;
import com.refineddata.security.services.ejb.api.administration.main.AppRegistryRequestImpl;
import com.refineddata.security.services.administration.main.ApplicationRegistryServiceLocal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/15/2016
 * @since 1.0
 */
@Path("administration/registration")
public class ApplicationRegistrationResourceImpl extends SecurityResourceImpl implements ApplicationRegistrationResource {

    private static final Logger log = LoggerFactory.getLogger(ApplicationRegistrationResourceImpl.class);

    @EJB
    private ApplicationRegistryServiceLocal applicationRegistryServiceLocal;

    @Override
    @POST
    public Response registerApplication(RESTAppRegistryRequest restAppRegistryRequest) {
        String restErrorMessagePrefix = "REST caught error while trying request for administration registration: ";
        try {
            log.debug("REST requesting to register administration..");
            AppRegistryRequest registryRequest = createAppRegistryRequest(restAppRegistryRequest);
            AppRegistryResponse response = applicationRegistryServiceLocal.registerApplication(registryRequest);
            log.debug("REST request for administration registration successfully accepted ");
            if (response.isSuccessful()) {
                return Response.status(Response.Status.CREATED).entity(response).build();
            } else {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity(response).build();
            }


        } catch (Exception e) {
            log.error(restErrorMessagePrefix + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    @PUT
    @Path("{appId}")
    public Response removeAppRegistry(@PathParam("appId") String appId) {
        String restErrorMessagePrefix = "REST caught error while trying request for administration registration: ";
        try {
            log.debug("REST requesting to register administration..");
            AppRegistryRemovalResponse response = applicationRegistryServiceLocal.removeAppRegistry(appId);
            RESTAppRegistryRemovalResponse restAppRegistryRemovalResponse = new RESTAppRegistryRemovalResponse(response.getAppId(), response.getName(), response.getRegistryRejectionReason());
            log.debug("REST request for administration registration successfully accepted ");
            if (response.isSuccessful()) {
                return Response.status(Response.Status.OK).entity(restAppRegistryRemovalResponse).build();
            } else {
                return Response.status(Response.Status.NOT_ACCEPTABLE).entity(response).build();
            }


        } catch (Exception e) {
            log.error(restErrorMessagePrefix + e.getMessage(), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }


    @Override
    @GET
    @Path("/template")
    public Response getRequestTemplate() {
        return Response.status(Response.Status.OK).entity(applicationRegistryServiceLocal.getRequestTemplate()).build();
    }


    private AppRegistryRequest createAppRegistryRequest(RESTAppRegistryRequest restAppRegistryRequest) {
        AppRegistryRequest registryRequest = new AppRegistryRequestImpl();
        registryRequest.setAppId(restAppRegistryRequest.getAppId());
        registryRequest.setApplicationName(restAppRegistryRequest.getApplicationName());

        return registryRequest;
    }
}
