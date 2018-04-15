package com.refineddata.security.dao.specs.application;

import com.refineddata.security.dao.specs.SecurityDAO;
import com.refineddata.security.domain.abstraction.application.Application;

/**
 * Data Access Object interfaces
 * for {@link Application}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/06/2016
 * @since 1.0
 */
public interface ApplicationDAO extends SecurityDAO<Application> {
    Application findByAppId(String appId);
}
