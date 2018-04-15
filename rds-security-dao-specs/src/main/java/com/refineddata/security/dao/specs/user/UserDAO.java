package com.refineddata.security.dao.specs.user;

import com.refineddata.security.dao.specs.SecurityDAO;
import com.refineddata.security.domain.abstraction.user.User;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/21/2016
 * @since 1.0
 */
public interface UserDAO extends SecurityDAO<User> {
    User findByEmail(String email);
}
