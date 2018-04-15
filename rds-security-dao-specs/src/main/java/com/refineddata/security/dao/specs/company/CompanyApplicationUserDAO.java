package com.refineddata.security.dao.specs.company;

import com.refineddata.security.dao.specs.SecurityDAO;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.concrete.company.CompanyApplicationUserImpl;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */
public interface CompanyApplicationUserDAO extends SecurityDAO<CompanyApplicationUser> {
    List<CompanyApplicationUser> findByUserEmailAndAppId(String userEmail, String appId);
}
