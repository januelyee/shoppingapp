package com.refineddata.security.entities.company;

import com.refineddata.security.domain.abstraction.company.AuthenticationInformation;
import com.refineddata.security.domain.abstraction.company.Company;
import com.refineddata.security.domain.abstraction.company.CompanyUser;
import com.refineddata.security.domain.abstraction.user.User;
import com.refineddata.security.domain.concrete.company.CompanyUserImpl;
import com.refineddata.security.entities.SecurityEntity;
import com.refineddata.security.entities.enums.RecordStatus;
import com.refineddata.security.entities.user.UserEntity;

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
import javax.persistence.Table;
import java.util.List;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/26/2016
 * @since 1.0
 */

@Entity
@NamedQueries( {
    @NamedQuery(name = "CompanyUserEntity.findAll", query = "SELECT c FROM CompanyUserEntity c " +
        "WHERE c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE"),

    @NamedQuery(name = "CompanyUserEntity.findByCompanyAndEmail", query = "SELECT c FROM CompanyUserEntity c " +
        "JOIN c.user u JOIN c.company o WHERE o.id = :companyId AND u.email = :email " +
        "AND c.recordStatus = com.refineddata.security.entities.enums.RecordStatus.ACTIVE")
})
@Table(name = "CompanyUser")
public class CompanyUserEntity extends CompanyUserImpl implements CompanyUser, SecurityEntity {

    private static final long serialVersionUID = -906463867094303403L;

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
    @ManyToOne(
        targetEntity = UserEntity.class
    )
    @JoinColumn(name = "user_ID")
    public User getUser() {
        return super.getUser();
    }


    @Override
    @ManyToOne(
        targetEntity = CompanyEntity.class
    )
    @JoinColumn(name = "company_ID")
    public Company getCompany() {
        return super.getCompany();
    }


    @Override
    @OneToMany(
        targetEntity = AuthenticationInformationEntity.class,
        fetch = FetchType.LAZY,
        cascade = {CascadeType.ALL},
        orphanRemoval = true,
        mappedBy = "companyUser"
    )
    public List<AuthenticationInformation> getAuthentications() {
        return super.getAuthenticationsListReference();
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
        return "CompanyUserEntity{" +
            "id=" + id +
            ", uuid='" + uuid + '\'' +
            ", recordStatus=" + recordStatus +
            "} " + super.toString();
    }
}
