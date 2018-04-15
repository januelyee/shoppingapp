package com.refineddata.security.rest.api.client.endpoints;

import com.refineddata.security.rest.api.SecurityResourceImpl;
import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginForm;
import com.refineddata.security.rest.api.client.resources.ClientApplicationAuthenticationResourceImpl;
import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginRequest;
import com.refineddata.security.rest.api.client.dataobjects.UserAuthenticationFormContent;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import com.refineddata.security.services.exceptions.SecurityServiceDataNotFoundException;
import com.refineddata.security.services.exceptions.SecurityServiceException;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/04/2016
 * @since 1.0
 */

@Path("client/authentication")
@Produces(MediaType.APPLICATION_JSON)
public class ClientApplicationAuthResourceEndpointImpl extends ClientApplicationAuthenticationResourceImpl implements ClientApplicationAuthResourceEndpoint {


    @Override
    @POST
    @Path("/loginrequest")
    public Response requestLoginEndpoint(SecurityRESTLoginRequest restLoginRequest) {
        try {
            UserAuthenticationFormContent formContent = super.requestLogin(restLoginRequest);
            return Response.ok(formContent).build();

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
    @POST
    @Path("/authenticate")
    public Response requestLoginAuthEndpoint(SecurityRESTLoginForm restLoginForm) {
        try {
            boolean success = super.requestLoginAuthentication(restLoginForm);

            if (success) {
                return Response.ok().build();

            } else {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

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


}
