package com.refineddata.security.daos.company;

import com.refineddata.security.dao.specs.company.CompanyApplicationUserDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;

import javax.ejb.Local;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */

@Local
public interface CompanyApplicationUserDAOLocal extends CompanyApplicationUserDAO, SecurityDAOLocal<CompanyApplicationUser> {

}
