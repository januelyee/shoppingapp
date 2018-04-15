-- Copyright (c) 2014. Refined Data Solutions. All Rights Reserved

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `security` ;
CREATE SCHEMA IF NOT EXISTS `security` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `security` ;

-- -----------------------------------------------------
-- Table `security`.`Application`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`Application` ;

CREATE TABLE `Application` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `name` VARCHAR(80) NULL,
  `appId` VARCHAR(255) NULL,
  `isRegistered` TINYINT(1) DEFAULT 0 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_UNIQUE` (`uuid`, `appId`)
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`Application` (`id`, `uuid`, `recordStatus`, `name`, `appId`, isRegistered)
VALUES (1, 'aab65775-ce52-49d4-a6ae-dbac224ad9b7', 'ACTIVE', 'Refined Data Security Service', 'rdss-007', 1);


-- -----------------------------------------------------
-- Table `security`.`Module`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`Module` ;

CREATE TABLE `security`.`Module`(
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `name` varchar(80) NULL,
  `application_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `module_UNIQUE` (`uuid`),
  KEY `module_application_FK` (`application_ID`),
  CONSTRAINT `module_application_fk_1` FOREIGN KEY (`application_ID`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;


-- -----------------------------------------------------
-- Table `security`.`Feature`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`Feature` ;

CREATE TABLE `security`.`Feature`(
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `name` varchar(80) NULL,
  `module_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feature_UNIQUE` (`uuid`),
  KEY `feature_module_FK` (`module_ID`),
  CONSTRAINT `feature_module_fk_1` FOREIGN KEY (`module_ID`) REFERENCES `Module` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;


-- -----------------------------------------------------
-- Table `security`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`User` ;

CREATE TABLE `User` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `firstName` VARCHAR(100) NULL,
  `lastName` VARCHAR(100) NULL,
  `email` VARCHAR(100) NULL,
  `isAuthenticatedExternally` TINYINT(1) DEFAULT 0 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_UNIQUE` (`uuid`)
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`User` (`id`, `uuid`, `recordStatus`, `firstName`, `lastName`, `email`, `isAuthenticatedExternally`)
VALUES (1, '515d87f9-45d4-41cf-b661-890a0a266e98', 'ACTIVE', 'Admin', 'Admin', 'admin@refinedddata.com', 0);


-- -----------------------------------------------------
-- Table `security`.`Company`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`Company` ;

CREATE TABLE `Company` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `name` VARCHAR(80) NULL,
  `logo` LONGTEXT NULL,
  `isRegistered` TINYINT(1) DEFAULT 0 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_UNIQUE` (`uuid`, `name`)
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`Company` (`id`, `uuid`, `recordStatus`, `name`, `logo`, `isRegistered`)
VALUES (1, 'e5449daf-af63-48a3-b944-2485705fcab2', 'ACTIVE', 'Refined Data Solutions', 'data:image/png;base64,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', 1);


-- -----------------------------------------------------
-- Table `security`.`CompanyApplication`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`CompanyApplication` ;

CREATE TABLE `CompanyApplication` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `company_ID` BIGINT(20) NOT NULL,
  `application_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companyapplication_UNIQUE` (`uuid`),
  KEY `companyapplication_application_FK` (`application_ID`),
  CONSTRAINT `companyapplication_application_fk_1` FOREIGN KEY (`application_ID`) REFERENCES `Application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `companyapplication_company_FK` (`application_ID`),
  CONSTRAINT `companyapplication_company_fk_1` FOREIGN KEY (`company_ID`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`CompanyApplication` (`id`, `uuid`, `recordStatus`, `company_ID`, `application_ID`)
VALUES (1, '8c1835ea-7e0f-4c8c-a744-459b51a4991d', 'ACTIVE', 1, 1);


-- -----------------------------------------------------
-- Table `security`.`CompanyUser`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`CompanyUser` ;

CREATE TABLE `CompanyUser` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `user_ID` BIGINT(20) NOT NULL,
  `company_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companyuser_UNIQUE` (`uuid`),
  KEY `companyuser_user_FK` (`user_ID`),
  CONSTRAINT `companyuser_user_fk_1` FOREIGN KEY (`user_ID`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `companyuser_company_FK` (`company_ID`),
  CONSTRAINT `companyuser_company_fk_1` FOREIGN KEY (`company_ID`) REFERENCES `Company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`CompanyUser` (`id`, `uuid`, `recordStatus`, `user_ID`, `company_ID`)
VALUES (1, 'cbbe8f32-9646-4f21-8702-cd76375649c4', 'ACTIVE', 1, 1);


-- -----------------------------------------------------
-- Table `security`.`AuthenticationInformation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`AuthenticationInformation` ;

CREATE TABLE `AuthenticationInformation` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `companyUser_ID` BIGINT(20) NOT NULL,
  `type` ENUM('PASSWORD', 'FINGERPRINT', 'BARCODE', 'QRCODE') NOT NULL DEFAULT 'PASSWORD',
  `authenticationCode` BLOB NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `authenticationinformation_UNIQUE` (`uuid`),
  KEY `authenticationinformation_companyuser_FK` (`companyUser_ID`),
  CONSTRAINT `authenticationinformation_companyuser_fk_1` FOREIGN KEY (`companyUser_ID`) REFERENCES `CompanyUser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`AuthenticationInformation` (`id`, `uuid`, `recordStatus`, `companyUser_ID`, `type`, `authenticationCode`)
VALUES (1, '01cd4905-20ca-4186-a298-7cb51ac2c45c', 'ACTIVE', 1, 'PASSWORD', 'basically');


-- -----------------------------------------------------
-- Table `security`.`CompanyApplicationUser`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`CompanyApplicationUser` ;

CREATE TABLE `CompanyApplicationUser` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `accessType` ENUM('READ', 'READ_WRITE') NOT NULL DEFAULT 'READ',
  `companyUser_ID` BIGINT(20) NOT NULL,
  `companyApplication_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companyapplicationuser_UNIQUE` (`uuid`),
  KEY `companyapplicationuser_companyuser_FK` (`companyUser_ID`),
  CONSTRAINT `companyapplicationuser_companyuser_fk_1` FOREIGN KEY (`companyUser_ID`) REFERENCES `CompanyUser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `companyapplicationuser_companyapplication_FK` (`companyApplication_ID`),
  CONSTRAINT `companyapplicationuser_companyapplication_fk_1` FOREIGN KEY (`companyApplication_ID`) REFERENCES `CompanyApplication` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;

INSERT INTO `security`.`CompanyApplicationUser` (`id`, `uuid`, `recordStatus`, `accessType`, `companyUser_ID`, `companyApplication_ID`)
VALUES (1, 'd5d47a7b-1a2b-4e05-a00c-7c54af6c2d2f', 'ACTIVE', 'READ_WRITE', 1, 1);


-- -----------------------------------------------------
-- Table `security`.`CompanyApplicationRole`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`CompanyApplicationRole` ;

CREATE TABLE `CompanyApplicationRole` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `name` VARCHAR(80) NULL,
  `accessType` ENUM('READ', 'READ_WRITE') NOT NULL DEFAULT 'READ',
  `companyApplication_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companyapplicationrole_UNIQUE` (`uuid`),
  KEY `companyapplicationrole_companyapplication_FK` (`companyApplication_ID`),
  CONSTRAINT `companyapplicationrole_companyapplication_fk_1` FOREIGN KEY (`companyApplication_ID`) REFERENCES `CompanyApplication` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;


-- -----------------------------------------------------
-- Table `security`.`CompanyApplicationUserRole`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `security`.`CompanyApplicationUserRole` ;

CREATE TABLE `CompanyApplicationUserRole` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NULL,
  `recordStatus` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  `companyApplicationUser_ID` BIGINT(20) NOT NULL,
  `companyApplicationRole_ID` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companyapplicationuserrole_UNIQUE` (`uuid`),
  KEY `companyapplicationuserrole_companyapplicationuser_FK` (`companyApplicationUser_ID`),
  CONSTRAINT `companyapplicationuserrole_companyapplicationuser_fk_1` FOREIGN KEY (`companyApplicationUser_ID`) REFERENCES `CompanyApplicationUser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `companyapplicationuserrole_companyapplicationrole_FK` (`companyApplicationRole_ID`),
  CONSTRAINT `companyapplicationuserrole_companyapplicationrole_fk_1` FOREIGN KEY (`companyApplicationRole_ID`) REFERENCES `CompanyApplicationRole` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;


USE `security` ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
