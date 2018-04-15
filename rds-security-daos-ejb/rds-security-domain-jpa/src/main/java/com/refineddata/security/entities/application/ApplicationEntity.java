package com.refineddata.security.entities.application;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.domain.concrete.application.SecurityApplication;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.util.PrePersistenceHelper;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import java.util.List;

/**
 * JPA entity version of Application.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 08/29/2016
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "ApplicationEntity.findAll", query = "SELECT a FROM ApplicationEntity a WHERE a.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE"),
    @NamedQuery(name = "ApplicationEntity.findByAppId", query = "SELECT a FROM ApplicationEntity a WHERE a.appId = :appId AND a.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "Application")
public class ApplicationEntity extends SecurityApplication implements Application, SecurityEntity {

    private static final long serialVersionUID = -1610850587622707056L;

    private Long id;

    private String uuid;

    private RecordStatus recordStatus;


    public ApplicationEntity() {

    }


    public ApplicationEntity(SecurityApplication application) {
        super.setName(application.getName());
        super.setAppId(application.getAppId());
        super.setIsRegistered(application.isRegistered());
        super.setModules(application.getModules());
    }


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
        targetEntity = ModuleEntity.class,
        fetch = FetchType.LAZY,
        cascade = {CascadeType.ALL},
        orphanRemoval = true,
        mappedBy = "parentApplication"
    )
    public List<ApplicationModule> getModules() {
        return super.getModulesListReference();
    }


    @Override
    @Column(name = "isRegistered")
    public boolean isRegistered() {
        return super.isRegistered();
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
        return "ApplicationEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
