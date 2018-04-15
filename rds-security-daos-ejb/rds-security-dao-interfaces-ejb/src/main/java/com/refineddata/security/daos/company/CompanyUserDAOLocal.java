package com.refineddata.security.daos.company;

import com.refineddata.security.dao.specs.company.CompanyUserDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;

import javax.ejb.Local;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Local
public interface CompanyUserDAOLocal extends CompanyUserDAO, SecurityDAOLocal<CompanyUser> {
    CompanyUser findByCompanyAndEmail(Company company, String email);
}
