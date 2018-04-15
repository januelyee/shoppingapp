package com.refineddata.security.rest.api.client.resources;

import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.rest.api.SecurityResourceImpl;
import com.refineddata.security.rest.api.client.dataobjects.SecurityLoginForm;
import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginForm;
import com.refineddata.security.rest.api.client.dataobjects.SecurityRESTLoginRequest;
import com.refineddata.security.rest.api.client.dataobjects.UserAuthenticationFormContent;
import com.refineddata.security.rest.api.client.dataobjects.UserAuthenticationFormContentImpl;
import com.refineddata.security.service.specs.client.LoginForm;
import com.refineddata.security.service.specs.client.LoginRequest;
import com.refineddata.security.services.client.LoginAssistanceServiceLocal;
import com.refineddata.security.services.client.UserAuthenticationServiceLocal;
import com.refineddata.security.services.ejb.api.client.LoginFormImpl;
import com.refineddata.security.services.ejb.api.client.LoginRequestImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.servlet.http.HttpSession;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/28/2016
 * @since 1.0
 */

@Path("client/authentication")
@Produces(MediaType.APPLICATION_JSON)
public abstract class ClientApplicationAuthenticationResourceImpl extends SecurityResourceImpl implements
    ClientApplicationAuthenticationResource<
        SecurityRESTLoginForm,
        SecurityRESTLoginRequest,
        UserAuthenticationFormContentImpl> {

    private static final Logger log = LoggerFactory.getLogger(ClientApplicationAuthenticationResourceImpl.class);

    @EJB
    private LoginAssistanceServiceLocal loginAssistanceServiceLocal;

    @EJB
    private UserAuthenticationServiceLocal userAuthenticationServiceLocal;


    @Override
    public UserAuthenticationFormContentImpl requestLogin(SecurityRESTLoginRequest restLoginRequest) {
        LoginRequest request = createLoginRequest(restLoginRequest);

        LoginForm formTemplate = userAuthenticationServiceLocal.requestLogin(request);
        SecurityLoginForm formTemplateToReturn = new SecurityRESTLoginForm(formTemplate);

        List<Company> companies = loginAssistanceServiceLocal.getListOfCompaniesForUserApplication(request);

        List<Company> filteredCompanies = getCleanedCompanyCyclicRelationships(companies);

        UserAuthenticationFormContent formContent = new UserAuthenticationFormContentImpl();
        formContent.setFormTemplate(formTemplateToReturn);
        formContent.setUserCompanies(filteredCompanies);

        return (UserAuthenticationFormContentImpl) formContent;
    }


    @Override
    public boolean requestLoginAuthentication(SecurityRESTLoginForm restLoginForm) {
        LoginForm loginForm = createLoginForm(restLoginForm);
        boolean success = userAuthenticationServiceLocal.authenticateUser(loginForm);

        if (success) {
            setupJSession(loginForm);
            log.debug("Login successful");

        } else {
            log.debug("Login unsuccessful");
        }

        return success;
    }


    private void setupJSession(LoginForm loginForm) {
        super.setSession(getHttpRequest().getSession(true)); // creates a session if it does not exist
        log.debug("Session created.");

        // store the email in the session
        HttpSession session = super.getSession();
        session.setAttribute("email", loginForm.getEmail());
    }


    private List<Company> getCleanedCompanyCyclicRelationships(List<Company> companies) {
        List<Company> filteredCompanies = new ArrayList<>();
        for (Company company : companies) {
            company.setCompanyApplications(null);
            filteredCompanies.add(company);
        }

        return filteredCompanies;
    }


    private LoginForm createLoginForm(SecurityRESTLoginForm restLoginForm) {
        LoginForm loginForm = new LoginFormImpl();
        loginForm.setEmail(restLoginForm.getEmail());
        loginForm.setAppId(restLoginForm.getAppId());
        loginForm.setCompanyIdentifier(restLoginForm.getCompanyIdentifier());
        loginForm.setAuthenticationType(restLoginForm.getAuthenticationType());
        loginForm.setAuthenticationCode(restLoginForm.getAuthenticationCode());

        return loginForm;
    }


    private LoginRequest createLoginRequest(SecurityRESTLoginRequest restLoginRequest) {
        LoginRequest loginRequest = new LoginRequestImpl();
        loginRequest.setAppId(restLoginRequest.getAppId());
        loginRequest.setEmail(restLoginRequest.getEmail());

        return loginRequest;
    }

}
