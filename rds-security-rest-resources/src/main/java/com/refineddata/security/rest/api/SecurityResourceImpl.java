package com.refineddata.security.rest.api;

import com.google.gson.JsonObject;
import com.refineddata.security.services.exceptions.InvalidSecurityServiceInputException;
import com.refineddata.security.services.exceptions.SecurityServiceDataNotFoundException;
import com.refineddata.security.services.exceptions.SecurityServiceException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/15/2016
 * @since 1.0
 */
public abstract class SecurityResourceImpl {

    @Context
    private HttpServletRequest httpRequest;

    @Context
    private HttpServletResponse httpResponse;

    @Context
    private HttpSession session;

    @Context
    private UriInfo uriInfo;


    public HttpServletRequest getHttpRequest() {
        return httpRequest;
    }


    public void setHttpRequest(HttpServletRequest httpRequest) {
        this.httpRequest = httpRequest;
    }


    public HttpServletResponse getHttpResponse() {
        return httpResponse;
    }


    public void setHttpResponse(HttpServletResponse httpResponse) {
        this.httpResponse = httpResponse;
    }


    public HttpSession getSession() {
        return session;
    }


    public void setSession(HttpSession session) {
        this.session = session;
    }


    public UriInfo getUriInfo() {
        return uriInfo;
    }


    public void setUriInfo(UriInfo uriInfo) {
        this.uriInfo = uriInfo;
    }


    private static String getErrorObjJson(String msg) {
        JsonObject error = new JsonObject();
        error.addProperty("error", msg);
        return error.toString();
    }

    public static Response generateSecurityServiceDataNotFoundResponse(SecurityServiceDataNotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateInvalidSecurityServiceInputResponse(InvalidSecurityServiceInputException e) {
        return Response.status(Response.Status.PRECONDITION_FAILED).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateSecurityServiceConstraintResponse(InvalidSecurityServiceInputException e) {
        return Response.status(Response.Status.EXPECTATION_FAILED).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateSecurityServiceErrorResponse(SecurityServiceException e) {
        return Response.status(Response.Status.BAD_REQUEST).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateGeneralErrorResponse(Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(getErrorObjJson(e.getMessage())).build();
    }
}
