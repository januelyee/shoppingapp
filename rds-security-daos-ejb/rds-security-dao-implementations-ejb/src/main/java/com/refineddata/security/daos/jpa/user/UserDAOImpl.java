package com.refineddata.security.daos.jpa.user;

import com.refineddata.security.daos.exceptions.InvalidSecurityDAOInputException;
import com.refineddata.security.daos.exceptions.SecurityDAOException;
import com.refineddata.security.daos.exceptions.SecurityEntityNotFoundException;
import com.refineddata.security.daos.jpa.DAOImpl2;
import com.refineddata.security.daos.user.UserDAOLocal;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.concrete.user.UserImpl;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.user.UserEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.Stateless;
import javax.persistence.NoResultException;
import javax.persistence.Query;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/21/2016
 * @since 1.0
 */

@Stateless
public class UserDAOImpl extends DAOImpl2<User> implements UserDAOLocal {

    private static final Logger log = LoggerFactory.getLogger(UserDAOImpl.class);

    @Override
    protected Long getSecurityEntityId(User t) {
        if (t instanceof UserEntity) {
            UserEntity entity = (UserEntity) t;
            return entity.getId();
        }

        return null;
    }


    @Override
    protected RecordStatus getSecurityEntityRecordStatus(User t) {
        if (t instanceof UserEntity) {
            UserEntity entity = (UserEntity) t;
            return entity.getRecordStatus();
        }

        return null;
    }



    @Override
    protected void setSecurityEntityRecordStatus(User t, RecordStatus recordStatus) {
        if (t instanceof UserEntity) {
            UserEntity entity = (UserEntity) t;
            entity.setRecordStatus(recordStatus);
        }
    }

    @Override
    protected Class getEntityClass() {
        return UserEntity.class;
    }


    @Override
    public UserImpl findByEmail(String email) {
        String errorString = "DAO error in findByEmail(String email): ";

        if (email == null) {
            errorString = errorString + "email is undefined!";
            log.error(errorString);
            throw new InvalidSecurityDAOInputException(errorString);
        }

        try {
            Query query = getEntityManager().createNamedQuery("UserEntity.findByEmail");
            query.setParameter("email", email);
            UserEntity found = (UserEntity) query.getSingleResult();
            getEntityManager().refresh(found);
            return found;

        } catch (NoResultException nre) {
            errorString = errorString + "User with email [" + email + "] not found.";
            log.error(errorString, nre);
            throw new SecurityEntityNotFoundException(errorString);

        } catch (Exception e) {
            errorString = errorString + "A system error has occurred searching for User with email [" + email + "]";
            log.error(errorString, e);
            throw new SecurityDAOException(errorString, e);

        }
    }
}
