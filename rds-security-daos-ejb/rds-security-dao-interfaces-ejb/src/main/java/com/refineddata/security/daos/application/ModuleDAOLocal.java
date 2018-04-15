package com.refineddata.security.daos.application;

import com.refineddata.security.dao.specs.application.ModuleDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;

import javax.ejb.Local;

/**
 * Local EJB Interface for {@link ModuleDAO}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */

@Local
public interface ModuleDAOLocal extends ModuleDAO, SecurityDAOLocal<ApplicationModule> {

}
