package com.refineddata.security.service.specs.administration.main;

/**
 * Holds response information for the request to register an administration.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public interface AppRegistryResponse {
    String getAppId();
    String getName();
    String getRegistryRejectionReason();
    boolean isSuccessful();
}
