package com.refineddata.security.dao.jpa.tests;

import com.refineddata.security.domain.abstraction.application.ApplicationModuleFeature;
import com.refineddata.security.domain.abstraction.application.ApplicationModule;
import com.refineddata.security.domain.enums.AccessType;
import com.refineddata.security.domain.enums.AuthenticationType;
import com.refineddata.security.entities.company.AuthenticationInformationEntity;
import com.refineddata.security.entities.company.CompanyApplicationEntity;
import com.refineddata.security.entities.company.CompanyApplicationUserEntity;
import com.refineddata.security.entities.company.CompanyEntity;
import com.refineddata.security.entities.company.CompanyUserEntity;
import com.refineddata.security.entities.user.UserEntity;
import com.refineddata.security.entities.util.UUIDUtil;
import com.refineddata.security.entities.application.ApplicationEntity;
import com.refineddata.security.entities.application.FeatureEntity;
import com.refineddata.security.entities.application.ModuleEntity;
import com.refineddata.security.entities.enums.RecordStatus;

import java.util.ArrayList;
import java.util.List;

/**
 * Factory for creating new SecurityEntity class instances.
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/09/2016
 * @since 1.0
 */
public class SecurityEntityFactory {

    public static ModuleEntity getModuleEntityInstance() {
        ModuleEntity moduleEntity = new ModuleEntity();
        moduleEntity.setName("test-" + UUIDUtil.generateUUIDString());
        moduleEntity.setRecordStatus(RecordStatus.ACTIVE);

        return moduleEntity;
    }


    public static FeatureEntity getFeatureEntityInstance() {
        FeatureEntity featureEntity = new FeatureEntity();
        featureEntity.setName("test-" + UUIDUtil.generateUUIDString());
        featureEntity.setRecordStatus(RecordStatus.ACTIVE);

        return featureEntity;
    }


    public static ApplicationEntity getApplicationEntityInstance() {
        ApplicationEntity applicationEntity = new ApplicationEntity();
        applicationEntity.setName("Test Application");
        applicationEntity.setRecordStatus(RecordStatus.ACTIVE);
        applicationEntity.setAppId(UUIDUtil.generateUUIDString() + "-test");
        applicationEntity.setIsRegistered(true);

        ApplicationModule module = getModuleEntityInstance();
        ApplicationModuleFeature feature = getFeatureEntityInstance();
        feature.setParentModule(module);
        List<ApplicationModuleFeature> features = new ArrayList<>();
        features.add(feature);
        module.setFeatures(features);

        module.setParentApplication(applicationEntity);
        List<ApplicationModule> modules = new ArrayList<>();
        modules.add(module);
        applicationEntity.setModules(modules);

        return applicationEntity;
    }


    public static CompanyApplicationEntity getCompanyApplicationEntityInstance() {
        CompanyApplicationEntity companyApplicationEntity = new CompanyApplicationEntity();
        companyApplicationEntity.setRecordStatus(RecordStatus.ACTIVE);
        return companyApplicationEntity;
    }


    public static CompanyEntity getCompanyEntityInstance() {
        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.setName("Test Company - " + UUIDUtil.generateUUIDString());
        companyEntity.setRecordStatus(RecordStatus.ACTIVE);

        return companyEntity;
    }


    public static UserEntity getUserEntityInstance() {
        UserEntity userEntity = new UserEntity();
        userEntity.setRecordStatus(RecordStatus.ACTIVE);
        userEntity.setEmail("tester@test.com");
        userEntity.setFirstName("Test");
        userEntity.setLastName("Tester");

        return userEntity;
    }


    public static CompanyUserEntity getCompanyUserEntityInstance() {
        CompanyUserEntity companyUserEntity = new CompanyUserEntity();
        companyUserEntity.setRecordStatus(RecordStatus.ACTIVE);
        return companyUserEntity;
    }


    public static AuthenticationInformationEntity getAuthenticationInformationEntityInstance() {
        AuthenticationInformationEntity authenticationInformationEntity = new AuthenticationInformationEntity();
        authenticationInformationEntity.setRecordStatus(RecordStatus.ACTIVE);
        authenticationInformationEntity.setType(AuthenticationType.PASSWORD);
        return authenticationInformationEntity;
    }


    public static CompanyApplicationUserEntity getCompanyApplicationUserEntityInstance() {
        CompanyApplicationUserEntity companyApplicationUserEntity = new CompanyApplicationUserEntity();
        companyApplicationUserEntity.setRecordStatus(RecordStatus.ACTIVE);
        companyApplicationUserEntity.setAccessType(AccessType.READ_WRITE);
        return companyApplicationUserEntity;
    }
}
