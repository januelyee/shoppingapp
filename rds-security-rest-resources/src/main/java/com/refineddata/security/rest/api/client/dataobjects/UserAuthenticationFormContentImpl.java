package com.refineddata.security.rest.api.client.dataobjects;

import com.refineddata.security.domain.abstraction.company.Company;

import java.util.Collections;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 10/04/2016
 * @since 1.0
 */
public final class UserAuthenticationFormContentImpl implements UserAuthenticationFormContent {

    private static final long serialVersionUID = -7816185658188613072L;
    private SecurityLoginForm formTemplate;
    private List<Company> userCompanies;


    @Override
    public SecurityLoginForm getFormTemplate() {
        return formTemplate;
    }


    @Override
    public void setFormTemplate(SecurityLoginForm formTemplate) {
        this.formTemplate = formTemplate;
    }


    @Override
    public List<Company> getUserCompanies() {
        return Collections.unmodifiableList(userCompanies);
    }


    @Override
    public void setUserCompanies(List<Company> userCompanies) {
        this.userCompanies = userCompanies;
    }


    @Override
    public String toString() {
        return "UserAuthenticationFormContent{" +
            "formTemplate=" + formTemplate +
            ", userCompanies=" + userCompanies +
            '}';
    }
}
