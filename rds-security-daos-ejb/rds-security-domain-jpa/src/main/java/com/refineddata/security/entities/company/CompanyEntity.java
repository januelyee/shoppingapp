package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.concrete.company.CompanyImpl;
import com.refineddata.security.domain.concrete.company.CompanyApplicationImpl;
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
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/19/2016
 * @since 1.0
 */
@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyEntity.findAll", query = "SELECT c FROM CompanyEntity c " +
        "WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "Company")
public class CompanyEntity extends CompanyImpl implements Company, SecurityEntity {

    private static final long serialVersionUID = 9000471523715262334L;

    private Long id;

    private String uuid;

    private RecordStatus recordStatus;


    public CompanyEntity() {
        super();
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
    @Enumerated(EnumType.STRING)
    public RecordStatus getRecordStatus() {
        if (recordStatus == null) {
            recordStatus = RecordStatus.ACTIVE;
        }
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
    @OneToMany(
        targetEntity = CompanyApplicationEntity.class,
        fetch = FetchType.LAZY,
        cascade = {CascadeType.ALL},
        orphanRemoval = true,
        mappedBy = "company"
    )
    public List<CompanyApplication> getCompanyApplications() {
        return super.getCompanyApplicationsListReference();
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
        return "CompanyEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
