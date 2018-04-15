package com.refineddata.security.services.ejb.api.administration.main;

import com.refineddata.security.service.specs.administration.main.AppRegistryRequest;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */
public class AppRegistryRequestImpl implements AppRegistryRequest {

    private String applicationName;
    private String appId;


    @Override
    public String getApplicationName() {
        return applicationName;
    }


    @Override
    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }


    @Override
    public String getAppId() {
        return appId;
    }


    @Override
    public void setAppId(String appId) {
        this.appId = appId;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        AppRegistryRequestImpl that = (AppRegistryRequestImpl) obj;

        if (getApplicationName() != null ? !getApplicationName().equals(that.getApplicationName()) : that.getApplicationName() != null) {
            return false;
        }
        return !(getAppId() != null ? !getAppId().equals(that.getAppId()) : that.getAppId() != null);

    }


    @Override
    public int hashCode() {
        int result = getApplicationName() != null ? getApplicationName().hashCode() : 0;
        result = 31 * result + (getAppId() != null ? getAppId().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "AppRegistryRequest{" +
            "applicationName='" + applicationName + '\'' +
            ", appId='" + appId + '\'' +
            '}';
    }
}
