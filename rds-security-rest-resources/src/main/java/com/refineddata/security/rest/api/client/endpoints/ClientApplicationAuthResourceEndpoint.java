package com.refineddata.security.rest.api.client.endpoints;

import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginForm;
import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginRequest;

import javax.ws.rs.core.Response;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/04/2016
 * @since 1.0
 */
public interface ClientApplicationAuthResourceEndpoint {
    Response requestLoginEndpoint(SecurityRESTLoginRequest restLoginRequest);
    Response requestLoginAuthEndpoint(SecurityRESTLoginForm restLoginForm);
}
