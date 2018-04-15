package com.refineddata.security.domain.concrete.application;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents a module in a registered administration.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public class SecurityApplicationModule implements ApplicationModule {

    private Application parentApplication;
    private String name;
    private List<ApplicationModuleFeature> features = new ArrayList<>();


    @Override
    public Application getParentApplication() {
        return parentApplication;
    }


    @Override
    public void setParentApplication(Application parentApplication) {
        this.parentApplication = parentApplication;
    }


    @Override
    public String getName() {
        return name;
    }


    @Override
    public void setName(String name) {
        this.name = name;
    }


    @Override
    public List<ApplicationModuleFeature> getFeatures() {
        return Collections.unmodifiableList(features);
    }


    protected List<ApplicationModuleFeature> getFeaturesListReference() {
        return getModifiableFeaturesList();
    }

    private List<ApplicationModuleFeature> getModifiableFeaturesList() {
        return features;
    }


    @Override
    public void setFeatures(List<ApplicationModuleFeature> features) {
        // Features should be unique.
        if (features != null) {
            for (ApplicationModuleFeature feature : features) {
                feature.setParentModule(this);
            }

            Set<ApplicationModuleFeature> featuresSet = new HashSet<>(features);
            this.features = new ArrayList<>(featuresSet);
        } else {
            this.features = null;
        }
    }


    @Override
    public void addFeature(ApplicationModuleFeature feature) {
        this.features.add(feature);
    }


    @Override
    public void addFeatures(List<ApplicationModuleFeature> features) {
        this.features.addAll(features);
    }


    @Override
    public void removeFeature(ApplicationModuleFeature feature) {
        this.features.remove(feature);
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof SecurityApplicationModule)) {
            return false;
        }

        SecurityApplicationModule module = (SecurityApplicationModule) obj;

        if (getParentApplication() != null ? !getParentApplication().equals(module.getParentApplication()) : module.getParentApplication() != null) {
            return false;
        }
        return !(getName() != null ? !getName().equals(module.getName()) : module.getName() != null);

    }


    @Override
    public int hashCode() {
        int result = getParentApplication() != null ? getParentApplication().hashCode() : 0;
        result = 31 * result + (getName() != null ? getName().hashCode() : 0);
        return result;
    }
}
