-- Copyright (c) 2014. Refined Data Solutions. All Rights Reserved

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `shopping` ;
CREATE SCHEMA IF NOT EXISTS `shopping` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `shopping` ;

-- -----------------------------------------------------
-- Table `shopping`.`Product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `shopping`.`Product` ;

CREATE TABLE `shopping`.`Product` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `productNumber` VARCHAR(255) NOT NULL,
  `price` DOUBLE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB CHARSET=latin1;


-- -----------------------------------------------------
-- Table `shopping`.`ProductAttribute`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `shopping`.`ProductAttribute` ;

CREATE TABLE `shopping`.`ProductAttribute`(
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `value` LONGTEXT NULL,
  `sequenceNumber` INT(10) NOT NULL,
  `product_id` BIGINT(20) NULL,
  PRIMARY KEY (`id`),
  KEY `productattribute_product_FK` (`product_id`),
  CONSTRAINT `productattribute_product_fk_1` FOREIGN KEY (`product_id`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;


-- -----------------------------------------------------
-- Table `shopping`.`InventoryItem`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `shopping`.`InventoryItem` ;

CREATE TABLE `shopping`.`InventoryItem`(
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `itemCode` VARCHAR(255) NOT NULL,
  `quantity` INT(10) NOT NULL,
  `product_id` BIGINT(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventoryitem_UNIQUE` (`product_id`),
  KEY `inventoryitem_product_FK` (`product_id`),
  CONSTRAINT `inventoryitem_product_fk_1` FOREIGN KEY (`product_id`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB CHARSET=latin1;

USE `shopping` ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
