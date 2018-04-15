package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.AuthenticationInformation;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.concrete.company.AuthenticationInformationImpl;
import com.refineddata.security.domain.enums.AuthenticationType;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.util.PrePersistenceHelper;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Entity
@Table(name = "AuthenticationInformation")
public class AuthenticationInformationEntity extends AuthenticationInformationImpl implements AuthenticationInformation, SecurityEntity {

    private static final long serialVersionUID = 2716430072076697178L;

    private Long id;

    private String uuid;

    private RecordStatus recordStatus;

    @PrePersist
    void prePersist() {
        PrePersistenceHelper.setRequiredPrePersistData(this);
    }


    @PreUpdate
    void preUpdate() {
        PrePersistenceHelper.setRequiredPreUpdateData(this);
    }


    @Override
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }


    @Override
    public void setId(Long id) {
        this.id = id;
    }


    @Override
    @Enumerated(EnumType.STRING)
    public RecordStatus getRecordStatus() {
        return recordStatus;
    }


    @Override
    public void setRecordStatus(RecordStatus recordStatus) {
        this.recordStatus = recordStatus;
    }


    @Override
    public String getUuid() {
        return uuid;
    }


    @Override
    public void setUuid(String uuid) {
        this.uuid = uuid;
    }


    @Override
    @Enumerated(EnumType.STRING)
    public AuthenticationType getType() {
        return super.getType();
    }


    @Override
    @ManyToOne(
        targetEntity = CompanyUserEntity.class
    )
    @JoinColumn(name = "companyUser_ID")
    public CompanyUser getCompanyUser() {
        return super.getCompanyUser();
    }


    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }


    @Override
    public int hashCode() {
        return super.hashCode();
    }


    @Override
    public String toString() {
        return "AuthenticationInformationEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
