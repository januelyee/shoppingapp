package com.refineddata.security.rest.api.client.dataobjects;

import java.io.Serializable;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/04/2016
 * @since 1.0
 */
public interface SecurityLoginRequest extends Serializable {

    String getAppId();
    void setAppId(String appId);
    String getEmail();
    void setEmail(String email);

}
