package com.refineddata.security.domain.concrete.user;

import com.refineddata.security.domain.abstraction.user.User;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
public class UserImpl implements User {
    private String firstName;
    private String lastName;
    private String email;

    private boolean isAuthenticatedExternally;


    @Override
    public String getFirstName() {
        return firstName;
    }


    @Override
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }


    @Override
    public String getLastName() {
        return lastName;
    }


    @Override
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }


    @Override
    public String getEmail() {
        return email;
    }


    @Override
    public void setEmail(String email) {
        this.email = email;
    }


    @Override
    public boolean isAuthenticatedExternally() {
        return isAuthenticatedExternally;
    }


    @Override
    public void setIsAuthenticatedExternally(boolean isAuthenticatedExternally) {
        this.isAuthenticatedExternally = isAuthenticatedExternally;
    }


    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }

        UserImpl user = (UserImpl) obj;

        return !(getEmail() != null ? !getEmail().equals(user.getEmail()) : user.getEmail() != null);

    }


    @Override
    public int hashCode() {
        return getEmail() != null ? getEmail().hashCode() : 0;
    }


    @Override
    public String toString() {
        return "User{" +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +
            ", isAuthenticatedExternally=" + isAuthenticatedExternally +
            '}';
    }
}
