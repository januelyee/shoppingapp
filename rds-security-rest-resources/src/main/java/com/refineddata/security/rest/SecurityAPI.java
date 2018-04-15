package com.refineddata.security.rest;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.ApplicationPath;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/29/2016
 * @since 1.0
 */
@ApplicationPath("/webapi")
public class SecurityAPI extends ResourceConfig {

    public SecurityAPI() {
        super(MultiPartFeature.class);
    }
}
