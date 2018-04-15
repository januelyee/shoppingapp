package com.refineddata.security.rest.api.client.dataobjects;

import com.refineddata.security.domain.abstraction.company.Company;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/28/2016
 * @since 1.0
 */
public interface UserAuthenticationFormContent extends Serializable {

    SecurityLoginForm getFormTemplate();
    void setFormTemplate(SecurityLoginForm formTemplate);
    List<Company> getUserCompanies();
    void setUserCompanies(List<Company> userCompanies);

}
