package com.refineddata.security.daos.application;

import com.refineddata.security.dao.specs.application.FeatureDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;

import javax.ejb.Local;

/**
 * Local EJB Interface for {@link FeatureDAO}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */

@Local
public interface FeatureDAOLocal extends FeatureDAO, SecurityDAOLocal<ApplicationModuleFeature> {

}
