package com.refineddata.security.service.specs.administration.main;

/**
 * Holds information about an administration registry request.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public interface AppRegistryRequest {

    String getApplicationName();
    void setApplicationName(String applicationName);
    String getAppId();
    void setAppId(String appId);

}
