package com.refineddata.security.services.ejb.api.client;

import com.refineddata.security.service.specs.client.LoginRequest;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/22/2016
 * @since 1.0
 */
public class LoginRequestImpl implements LoginRequest {

    private String appId;
    private String email;

    public LoginRequestImpl() {}

    @Override
    public String getAppId() {
        return appId;
    }


    @Override
    public void setAppId(String appId) {
        this.appId = appId;
    }


    @Override
    public String getEmail() {
        return email;
    }


    @Override
    public void setEmail(String email) {
        this.email = email;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        LoginRequestImpl that = (LoginRequestImpl) o;

        if (getAppId() != null ? !getAppId().equals(that.getAppId()) : that.getAppId() != null) {
            return false;
        }
        return !(getEmail() != null ? !getEmail().equals(that.getEmail()) : that.getEmail() != null);

    }


    @Override
    public int hashCode() {
        int result = getAppId() != null ? getAppId().hashCode() : 0;
        result = 31 * result + (getEmail() != null ? getEmail().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "LoginRequestImpl{" +
            "appId='" + appId + '\'' +
            ", email='" + email + '\'' +
            '}';
    }
}
