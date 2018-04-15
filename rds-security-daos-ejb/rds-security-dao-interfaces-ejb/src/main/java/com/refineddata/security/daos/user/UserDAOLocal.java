package com.refineddata.security.daos.user;

import com.refineddata.security.dao.specs.user.UserDAO;
import com.refineddata.security.daos.SecurityDAOLocal;
import com.refineddata.security.domain.abstraction.user.User;

import javax.ejb.Local;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/21/2016
 * @since 1.0
 */

@Local
public interface UserDAOLocal extends UserDAO, SecurityDAOLocal<User> {

}
