package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplicationRole;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUser;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationUserRole;
import com.refineddata.security.domain.concrete.company.CompanyApplicationUserRoleImpl;
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
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyApplicationUserRoleEntity.findAll", query = "SELECT c FROM CompanyApplicationUserRoleEntity c " +
        "WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE"),
})
@Table(name = "CompanyApplicationUserRole")
public class CompanyApplicationUserRoleEntity extends CompanyApplicationUserRoleImpl implements CompanyApplicationUserRole, SecurityEntity {

    private static final long serialVersionUID = 281244652553365646L;

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
    @ManyToOne(targetEntity = CompanyApplicationUserEntity.class)
    @JoinColumn(name = "companyApplicationUser_ID")
    public CompanyApplicationUser getUser() {
        return super.getUser();
    }


    @Override
    @ManyToOne(
        targetEntity = CompanyApplicationRoleEntity.class
    )
    @JoinColumn(name = "companyApplicationRole_ID")
    public CompanyApplicationRole getRole() {
        return super.getRole();
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
        return "CompanyApplicationUserRoleEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
