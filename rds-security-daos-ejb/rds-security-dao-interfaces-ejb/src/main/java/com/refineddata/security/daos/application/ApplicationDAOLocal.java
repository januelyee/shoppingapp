package com.refineddata.security.daos.application;

import com.refineddata.security.dao.specs.application.ApplicationDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.domain.abstraction.application.Application;

import javax.ejb.Local;

/**
 * Local EJB Interface for {@link ApplicationDAO}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */
@Local
public interface ApplicationDAOLocal extends ApplicationDAO, SecurityDAOLocal<Application> {

    @Override
    Application findByAppId(String appId) throws InvalidSecurityDAOInputException, SecurityEntityNotFoundException, SecurityDAOException;
}
