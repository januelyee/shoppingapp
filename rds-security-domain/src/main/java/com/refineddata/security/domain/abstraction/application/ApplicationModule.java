package com.refineddata.security.domain.abstraction.application;

import java.util.List;

/**
 * Represents a module in a registered administration.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public interface ApplicationModule {
    Application getParentApplication();
    void setParentApplication(Application parentApplication);
    String getName();
    void setName(String name);
    List<ApplicationModuleFeature> getFeatures();
    void setFeatures(List<ApplicationModuleFeature> features);
    void addFeature(ApplicationModuleFeature feature);
    void addFeatures(List<ApplicationModuleFeature> features);
    void removeFeature(ApplicationModuleFeature feature);
}
