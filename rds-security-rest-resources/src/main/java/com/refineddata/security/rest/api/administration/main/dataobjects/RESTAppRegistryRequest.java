package com.refineddata.security.rest.api.administration.main.dataobjects;

import javax.xml.bind.annotation.XmlSeeAlso;
import java.io.Serializable;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/03/2016
 * @since 1.0
 */

public class RESTAppRegistryRequest implements Serializable {

    private static final long serialVersionUID = 7758245432419030786L;
    private String applicationName;
    private String appId;


    public RESTAppRegistryRequest() {
    }


    public String getApplicationName() {
        return applicationName;
    }


    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }


    public String getAppId() {
        return appId;
    }


    public void setAppId(String appId) {
        this.appId = appId;
    }
}
