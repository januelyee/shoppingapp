package com.refineddata.security.services.ejb.business.administration.main.interfaces;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.services.ejb.business.BusinessService;
import com.refineddata.security.services.ejb.interfaces.SecurityInformationManager;

import javax.ejb.Local;
import java.util.List;

/**
 * Interface for administration information management.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/14/2016
 * @since 1.0
 */

@Local
public interface ApplicationInformationManager extends SecurityInformationManager<Application>, BusinessService {

    List<String> getModuleNames(Application appInfo);

}
