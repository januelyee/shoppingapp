package com.refineddata.security.domain.abstraction.application;

/**
 * A feature of an administration module.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public interface ApplicationModuleFeature {
    ApplicationModule getParentModule();
    void setParentModule(ApplicationModule parentModule);
    String getName();
    void setName(String name);
}
