package com.refineddata.security.entities.util;

import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/20/2016
 * @since 1.0
 */
public class PrePersistenceHelper {
    public static void setRequiredPrePersistData(SecurityEntity entity) {
        setRequiredCommonData(entity);
    }


    public static void setRequiredPreUpdateData(SecurityEntity entity) {
        setRequiredCommonData(entity);
    }


    private static void setRequiredCommonData(SecurityEntity entity) {
        if (entity.getUuid() == null) {
            entity.setUuid(UUIDUtil.generateUUIDString());
        }

        if (entity.getRecordStatus() == null) {
            entity.setRecordStatus(RecordStatus.ACTIVE);
        }
    }
}
