package com.januelyee.shoppingcart.rest;

import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

import javax.ws.rs.ApplicationPath;

@ApplicationPath("/webapi")
public class ShoppingAPI extends ResourceConfig {

    public ShoppingAPI() {
        super(MultiPartFeature.class);
    }

}
