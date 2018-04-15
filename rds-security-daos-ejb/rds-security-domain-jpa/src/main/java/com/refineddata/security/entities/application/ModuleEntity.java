package com.refineddata.security.entities.application;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.domain.concrete.application.SecurityApplicationModule;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.util.PrePersistenceHelper;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import java.util.List;

/**
 * JPA entity version of Module.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "ModuleEntity.findAll", query = "SELECT m FROM ModuleEntity m WHERE m.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "Module")
public class ModuleEntity extends SecurityApplicationModule implements ApplicationModule, SecurityEntity {

    private static final long serialVersionUID = -8154847032541235857L;

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
    @OneToMany(
        targetEntity = FeatureEntity.class,
        fetch = FetchType.LAZY,
        cascade = {CascadeType.ALL},
        orphanRemoval = true,
        mappedBy = "parentModule"
    )
    public List<ApplicationModuleFeature> getFeatures() {
        return super.getFeaturesListReference();
    }


    @Override
    @ManyToOne(targetEntity = ApplicationEntity.class)
    @JoinColumn(name = "application_ID")
    public Application getParentApplication() {
        return super.getParentApplication();
    }
}
