package com.refineddata.security.service.specs.client;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public interface LoginRequest {
    String getAppId();
    void setAppId(String appId);
    String getEmail();
    void setEmail(String email);
}
