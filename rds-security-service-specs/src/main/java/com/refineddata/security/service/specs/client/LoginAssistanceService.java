package com.refineddata.security.service.specs.client;

import com.refineddata.security.domain.abstraction.company.Company;

import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */
public interface LoginAssistanceService {
    List<Company> getListOfCompaniesForUserApplication(LoginRequest request);
}
