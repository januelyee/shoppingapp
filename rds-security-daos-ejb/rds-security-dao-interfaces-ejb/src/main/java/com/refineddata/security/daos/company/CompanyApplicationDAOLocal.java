package com.refineddata.security.daos.company;

import com.refineddata.security.dao.specs.company.CompanyApplicationDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;

import javax.ejb.Local;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */

@Local
public interface CompanyApplicationDAOLocal extends CompanyApplicationDAO, SecurityDAOLocal<CompanyApplication> {

}
