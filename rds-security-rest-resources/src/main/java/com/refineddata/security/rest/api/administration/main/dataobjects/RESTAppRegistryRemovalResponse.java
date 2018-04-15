package com.refineddata.security.rest.api.administration.main.dataobjects;

import java.io.Serializable;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */
public class RESTAppRegistryRemovalResponse implements Serializable {

    private static final long serialVersionUID = -3730234168984233270L;
    private String appName;
    private String appId;
    private String removalRejectionReason;
    private boolean isSuccessful;


    public RESTAppRegistryRemovalResponse() {
    }


    public RESTAppRegistryRemovalResponse(String appId, String name, String registryRejectionReason) {
        if (registryRejectionReason == null) {
            isSuccessful = true;
        }

        this.appId = appId;
        this.appName = name;
        this.removalRejectionReason = registryRejectionReason;
    }


    public String getAppId() {
        return appId;
    }


    public String getName() {
        return appName;
    }



    public String getRegistryRejectionReason() {
        return removalRejectionReason;
    }



    public boolean isSuccessful() {
        return isSuccessful;
    }

}
