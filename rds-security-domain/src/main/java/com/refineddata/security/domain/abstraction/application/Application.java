package com.refineddata.security.domain.abstraction.application;

import java.util.List;
import java.util.Set;

/**
 * Represents an Application that is registered to use security services.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public interface Application {
    String getName();
    void setName(String name);
    String getAppId();
    void setAppId(String appId);
    boolean isRegistered();
    void setIsRegistered(boolean isRegistered);
    List<ApplicationModule> getModules();
    void setModules(List<ApplicationModule> modules);
    void addModule(ApplicationModule module);
    void addModules(Set<ApplicationModule> modules);
    void removeModule(ApplicationModule module);
}
