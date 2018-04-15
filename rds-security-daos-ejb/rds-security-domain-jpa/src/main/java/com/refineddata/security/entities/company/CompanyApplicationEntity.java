package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.application.Application;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.concrete.company.CompanyApplicationImpl;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.application.ApplicationEntity;
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
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyApplicationEntity.findAll", query = "SELECT c FROM CompanyApplicationEntity c WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "CompanyApplication")
public class CompanyApplicationEntity extends CompanyApplicationImpl implements CompanyApplication, SecurityEntity {

    private static final long serialVersionUID = 4215542731071113232L;

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
    @ManyToOne(targetEntity = CompanyEntity.class)
    @JoinColumn(name = "company_ID")
    public Company getCompany() {
        return super.getCompany();
    }


    @Override
    @ManyToOne(targetEntity = ApplicationEntity.class)
    @JoinColumn(name = "application_ID")
    public Application getApplication() {
        return super.getApplication();
    }
}
