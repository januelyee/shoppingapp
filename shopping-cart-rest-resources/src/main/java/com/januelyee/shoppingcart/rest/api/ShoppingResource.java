package com.januelyee.shoppingcart.rest.api;

import com.google.gson.JsonObject;
import com.januelyee.shoppingcart.services.ejb.implementations.exceptions.ServiceInvalidInputException;
import com.januelyee.shoppingcart.services.ejb.implementations.exceptions.ServiceRecordNotFoundException;
import com.januelyee.shoppingcart.services.ejb.implementations.exceptions.ServiceShoppingConstraintException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

public abstract class ShoppingResource {

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

    public static Response generateServiceRecordNotFoundResponse(ServiceRecordNotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateInvalidServiceInputResponse(ServiceInvalidInputException e) {
        return Response.status(Response.Status.PRECONDITION_FAILED).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateServiceShoppingConstraintResponse(ServiceShoppingConstraintException e) {
        return Response.status(Response.Status.EXPECTATION_FAILED).entity(getErrorObjJson(e.getMessage())).build();
    }


    public static Response generateGeneralErrorResponse(Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(getErrorObjJson(e.getMessage())).build();
    }
}
