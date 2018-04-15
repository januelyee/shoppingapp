package com.refineddata.security.domain.concrete.application;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents an Application that is registered to use security services.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public class SecurityApplication implements Application {

    private String name;
    private String appId;
    private boolean isRegistered;
    private List<ApplicationModule> modules = new ArrayList<>();


    @Override
    public String getName() {
        return name;
    }


    @Override
    public void setName(String name) {
        this.name = name;
    }


    @Override
    public String getAppId() {
        return appId;
    }


    @Override
    public void setAppId(String appId) {
        this.appId = appId;
    }


    @Override
    public boolean isRegistered() {
        return isRegistered;
    }


    @Override
    public void setIsRegistered(boolean isRegistered) {
        this.isRegistered = isRegistered;
    }


    @Override
    public List<ApplicationModule> getModules() {
        return Collections.unmodifiableList(modules);
    }


    protected List<ApplicationModule> getModulesListReference() {
        return getModifiableModulesList();
    }

    private List<ApplicationModule> getModifiableModulesList() {
        return modules;
    }


    @Override
    public void setModules(List<ApplicationModule> modules) {
        // Modules should be unique.
        if (modules != null) {
            for (ApplicationModule module : modules) {
                module.setParentApplication(this);
            }

            Set<ApplicationModule> modulesSet = new HashSet<>(modules);
            this.modules = new ArrayList<>(modulesSet);
        } else {
            this.modules = null;
        }
    }


    @Override
    public void addModule(ApplicationModule module) {
        module.setParentApplication(this);
        modules.add(module);
    }


    @Override
    public void addModules(Set<ApplicationModule> modules) {
        for (ApplicationModule module : modules) {
            module.setParentApplication(this);
        }

        this.modules.addAll(modules);
    }


    @Override
    public void removeModule(ApplicationModule module) {
        modules.remove(module);
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof SecurityApplication)) {
            return false;
        }

        SecurityApplication thatObj = (SecurityApplication) obj;

        if (getName() != null ? !getName().equals(thatObj.getName()) : thatObj.getName() != null) {
            return false;
        }
        return !(getAppId() != null ? !getAppId().equals(thatObj.getAppId()) : thatObj.getAppId() != null);

    }


    @Override
    public int hashCode() {
        int result = getName() != null ? getName().hashCode() : 0;
        result = 31 * result + (getAppId() != null ? getAppId().hashCode() : 0);
        return result;
    }
}
