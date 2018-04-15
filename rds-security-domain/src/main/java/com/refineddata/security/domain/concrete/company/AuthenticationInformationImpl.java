package com.refineddata.security.domain.concrete.company;

import com.refineddata.security.domain.abstraction.company.AuthenticationInformation;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.enums.AuthenticationType;

/**
 * AuthenticationInformation contains information the type of authentication and the
 * authentication key/code that needs to be authenticated.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/30/2016
 * @since 1.0
 */
public class AuthenticationInformationImpl implements AuthenticationInformation {

    private CompanyUser companyUser;
    private AuthenticationType type;
    private byte[] authenticationCode; // byte[] is more secure than String


    @Override
    public AuthenticationType getType() {
        return type;
    }


    @Override
    public void setType(AuthenticationType type) {
        this.type = type;
    }


    @Override
    public byte[] getAuthenticationCode() {
        return authenticationCode.clone();
    }


    @Override
    public void setAuthenticationCode(byte[] authenticationCode) {
        this.authenticationCode = authenticationCode;
    }


    @Override
    public CompanyUser getCompanyUser() {
        return companyUser;
    }


    @Override
    public void setCompanyUser(CompanyUser companyUser) {
        this.companyUser = companyUser;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        AuthenticationInformationImpl that = (AuthenticationInformationImpl) obj;

        if (getCompanyUser() != null ? !getCompanyUser().equals(that.getCompanyUser()) : that.getCompanyUser() != null) {
            return false;
        }
        return getType() == that.getType();

    }


    @Override
    public int hashCode() {
        int result = getCompanyUser() != null ? getCompanyUser().hashCode() : 0;
        result = 31 * result + (getType() != null ? getType().hashCode() : 0);
        return result;
    }


    @Override
    public String toString() {
        return "AuthenticationInformation{" +
            "type=" + type +
            ", companyUser=" + companyUser +
            '}';
    }
}
