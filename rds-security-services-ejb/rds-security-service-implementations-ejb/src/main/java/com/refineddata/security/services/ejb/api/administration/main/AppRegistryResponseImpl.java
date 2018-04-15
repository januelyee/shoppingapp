package com.refineddata.security.services.ejb.api.administration.main;

import com.refineddata.security.service.specs.administration.main.AppRegistryResponse;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public class AppRegistryResponseImpl implements AppRegistryResponse {

    private String appId;
    private String appName;
    private String registryRejectionReason;
    private boolean isSuccessful;


    public AppRegistryResponseImpl(String appId, String name, String registryRejectionReason) {
        if (registryRejectionReason == null) {
            isSuccessful = true;
        }

        this.appId = appId;
        this.appName = name;
        this.registryRejectionReason = registryRejectionReason;
    }


    @Override
    public String getAppId() {
        return appId;
    }

    @Override
    public String getName() {
        return appName;
    }


    @Override
    public String getRegistryRejectionReason() {
        return registryRejectionReason;
    }


    @Override
    public boolean isSuccessful() {
        return isSuccessful;
    }


    @Override
    public String toString() {
        return "AppRegistryResponse{" +
            "appId='" + appId + '\'' +
            ", appName='" + appName + '\'' +
            ", registryRejectionReason='" + registryRejectionReason + '\'' +
            ", isSuccessful=" + isSuccessful +
            '}';
    }
}
