package com.refineddata.security.service.specs.administration.main;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public interface AppRegistryRemovalResponse {
    String getAppId();
    String getName();
    String getRegistryRejectionReason();
    boolean isSuccessful();
}
