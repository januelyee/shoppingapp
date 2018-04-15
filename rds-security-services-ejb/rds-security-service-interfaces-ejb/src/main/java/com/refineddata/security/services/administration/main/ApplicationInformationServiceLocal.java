package com.refineddata.security.services.administration.main;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.service.specs.administration.main.ApplicationInformationService;
import com.refineddata.security.services.SecurityInformationServiceLocal;

import javax.ejb.Local;

/**
 * Local EJB interfaces version of {@link ApplicationInformationService}.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/12/2016
 * @since 1.0
 */

@Local
public interface ApplicationInformationServiceLocal extends ApplicationInformationService, SecurityInformationServiceLocal<Application> {

}
