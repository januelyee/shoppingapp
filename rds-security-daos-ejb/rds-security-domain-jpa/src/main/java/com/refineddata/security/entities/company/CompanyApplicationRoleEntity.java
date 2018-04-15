package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.CompanyApplication;
import com.refineddata.security.domain.abstraction.company.CompanyApplicationRole;
import com.refineddata.security.domain.concrete.company.CompanyApplicationRoleImpl;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyApplicationRoleEntity.findAll", query = "SELECT c FROM CompanyApplicationRoleEntity c WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "CompanyApplicationRole")
public class CompanyApplicationRoleEntity extends CompanyApplicationRoleImpl implements CompanyApplicationRole, SecurityEntity {

    private static final long serialVersionUID = -2664032877674890041L;

    private Long id;

    private String uuid;

    private RecordStatus recordStatus;


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
    @ManyToOne(
        targetEntity = CompanyApplicationEntity.class
    )
    @JoinColumn(name = "companyApplication_ID")
    public CompanyApplication getCompanyApplication() {
        return super.getCompanyApplication();
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
        return "CompanyApplicationRoleEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
