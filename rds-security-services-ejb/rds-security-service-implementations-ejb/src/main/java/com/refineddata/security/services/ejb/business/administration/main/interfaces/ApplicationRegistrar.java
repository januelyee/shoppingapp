package com.refineddata.security.services.ejb.business.administration.main.interfaces;

import com.refineddata.security.services.ejb.business.BusinessService;

import javax.ejb.Local;

/**
 * Responsible for handling administration registrations.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */

@Local
public interface ApplicationRegistrar extends BusinessService {

    void registerApp(String name, String appId);
    void unregisterApp(String appId);

}
