package com.refineddata.security.domain.concrete.application;

import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;

/**
 * A feature of an administration module.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public class SecurityApplicationModuleFeature implements ApplicationModuleFeature {

    private ApplicationModule parentModule;
    private String name;


    @Override
    public ApplicationModule getParentModule() {
        return parentModule;
    }


    @Override
    public void setParentModule(ApplicationModule parentModule) {
        this.parentModule = parentModule;
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
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof SecurityApplicationModuleFeature)) {
            return false;
        }

        SecurityApplicationModuleFeature feature = (SecurityApplicationModuleFeature) obj;

        if (getParentModule() != null ? !getParentModule().equals(feature.getParentModule()) : feature.getParentModule() != null) {
            return false;
        }
        return !(getName() != null ? !getName().equals(feature.getName()) : feature.getName() != null);

    }


    @Override
    public int hashCode() {
        int result = getParentModule() != null ? getParentModule().hashCode() : 0;
        result = 31 * result + (getName() != null ? getName().hashCode() : 0);
        return result;
    }
}
