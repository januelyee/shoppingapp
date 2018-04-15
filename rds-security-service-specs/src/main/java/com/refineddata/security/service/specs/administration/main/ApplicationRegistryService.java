package com.refineddata.security.service.specs.administration.main;

/**
 * Service to handle administration registrations.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public interface ApplicationRegistryService {

    /**
     * Initiates the registration of an administration using the information provided in the {@link AppRegistryRequest}
     * parameter.  Returns a response with information about the registration - successful or not.
     *
     * @param registryRequest - The administration registry request information.
     * @return - The response to the request for administration registry.
     */
    AppRegistryResponse registerApplication(AppRegistryRequest registryRequest);


    /**
     * Initiates the removal of an administration registration.  Returns a response with information about the
     * removal - successful or not.
     *
     * @param appId - The administration ID of the administration to be removed.
     * @return - The response to the request for removal of administration from the registry.
     */
    AppRegistryRemovalResponse removeAppRegistry(String appId);


    /**
     * A courtesy method that returns an empty {@link AppRegistryRequest} object to be filled out before submission.
     *
     * @return - The empty {@link AppRegistryRequest} object.
     */
    AppRegistryRequest getRequestTemplate();

}
