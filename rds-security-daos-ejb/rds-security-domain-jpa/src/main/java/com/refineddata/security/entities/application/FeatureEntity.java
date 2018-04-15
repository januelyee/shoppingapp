package com.refineddata.security.entities.application;

import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.domain.concrete.application.SecurityApplicationModuleFeature;
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
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

/**
 * JPA entity version of Feature.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "FeatureEntity.findAll", query = "SELECT f FROM FeatureEntity f WHERE F.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "Feature")
public class FeatureEntity extends SecurityApplicationModuleFeature implements ApplicationModuleFeature, SecurityEntity {

    private static final long serialVersionUID = -5784559804154430788L;

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
    public String getUuid() {
        return uuid;
    }


    @Override
    public void setUuid(String uuid) {
        this.uuid = uuid;
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
    @ManyToOne(
        targetEntity = ModuleEntity.class
    )
    @JoinColumn(name = "module_ID")
    public ApplicationModule getParentModule() {
        return super.getParentModule();
    }
}
