package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUserRole;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.concrete.company.CompanyApplicationUserImpl;
import com.refineddata.security.domain.enums.AccessType;
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
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/23/2016
 * @since 1.0
 */

@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyApplicationUserEntity.findAll", query = "SELECT c FROM CompanyApplicationUserEntity c " +
        "WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE"),

    @NamedQuery(name = "CompanyApplicationUserEntity.findByUserEmailAndAppId", query = "SELECT c FROM CompanyApplicationUserEntity c " +
        "JOIN c.user u JOIN c.application a JOIN u.user s JOIN a.application p WHERE s.email = :email AND p.appId = :appId " +
        "AND c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "CompanyApplicationUser")
public class CompanyApplicationUserEntity extends CompanyApplicationUserImpl implements CompanyApplicationUser, SecurityEntity {

    private static final long serialVersionUID = -2271926735487085020L;

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
    public AccessType getAccessType() {
        return super.getAccessType();
    }


    @Override
    @ManyToOne(
        targetEntity = CompanyUserEntity.class
    )
    @JoinColumn(name = "companyUser_ID")
    public CompanyUser getUser() {
        return super.getUser();
    }


    @Override
    @ManyToOne(
        targetEntity = CompanyApplicationEntity.class
    )
    @JoinColumn(name = "companyApplication_ID")
    public CompanyApplication getApplication() {
        return super.getApplication();
    }


    @Override
    @OneToMany(
        targetEntity = CompanyApplicationUserRoleEntity.class,
        fetch = FetchType.LAZY,
        cascade = {CascadeType.ALL},
        orphanRemoval = true,
        mappedBy = "user"
    )
    public List<CompanyApplicationUserRole> getRoles() {
        return super.getRolesListReference();
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
        return "CompanyApplicationUserEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
