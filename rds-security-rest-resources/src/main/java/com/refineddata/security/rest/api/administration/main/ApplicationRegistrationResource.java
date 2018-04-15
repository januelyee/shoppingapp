package com.refineddata.security.rest.api.administration.main;

import com.refineddata.security.rest.api.administration.main.dataobjects.RESTAppRegistryRequest;
import javax.ws.rs.core.Response;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public interface ApplicationRegistrationResource {
    Response registerApplication(RESTAppRegistryRequest restAppRegistryRequest);
    Response removeAppRegistry(String appId);
    Response getRequestTemplate();
}
