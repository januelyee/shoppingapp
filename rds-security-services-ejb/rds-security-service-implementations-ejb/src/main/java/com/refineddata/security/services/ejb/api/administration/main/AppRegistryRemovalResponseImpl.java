package com.refineddata.security.services.ejb.api.administration.main;

import com.refineddata.security.service.specs.administration.main.AppRegistryRemovalResponse;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public class AppRegistryRemovalResponseImpl implements AppRegistryRemovalResponse {
    private String appName;
    private String appId;
    private String removalRejectionReason;
    private boolean isSuccessful;


    public AppRegistryRemovalResponseImpl(String appId, String name, String registryRejectionReason) {
        if (registryRejectionReason == null) {
            isSuccessful = true;
        }

        this.appId = appId;
        this.appName = name;
        this.removalRejectionReason = registryRejectionReason;
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
        return removalRejectionReason;
    }


    @Override
    public boolean isSuccessful() {
        return isSuccessful;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AppRegistryRemovalResponseImpl that = (AppRegistryRemovalResponseImpl) o;

        if (isSuccessful() != that.isSuccessful()) {
            return false;
        }
        if (appName != null ? !appName.equals(that.appName) : that.appName != null) {
            return false;
        }
        if (getAppId() != null ? !getAppId().equals(that.getAppId()) : that.getAppId() != null) {
            return false;
        }
        return !(removalRejectionReason != null ? !removalRejectionReason.equals(that.removalRejectionReason) : that.removalRejectionReason != null);

    }


    @Override
    public int hashCode() {
        int result = appName != null ? appName.hashCode() : 0;
        result = 31 * result + (getAppId() != null ? getAppId().hashCode() : 0);
        result = 31 * result + (removalRejectionReason != null ? removalRejectionReason.hashCode() : 0);
        result = 31 * result + (isSuccessful() ? 1 : 0);
        return result;
    }


    @Override
    public String toString() {
        return "AppRegistryRemovalResponse{" +
            "appName='" + appName + '\'' +
            ", appId='" + appId + '\'' +
            ", removalRejectionReason='" + removalRejectionReason + '\'' +
            ", isSuccessful=" + isSuccessful +
            '}';
    }
}
