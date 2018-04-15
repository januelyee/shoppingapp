package com.refineddata.security.entities;

import com.refineddata.security.entities.enums.RecordStatus;

import java.io.Serializable;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/30/2016
 * @since 1.0
 */
public interface SecurityEntity extends Serializable {

    Long getId();
    void setId(Long id);
    RecordStatus getRecordStatus();
    void setRecordStatus(RecordStatus recordStatus);
    String getUuid();
    void setUuid(String uuid);

}
